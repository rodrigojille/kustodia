import { Request, Response } from "express";
import ormconfig from '../ormconfig';
import { Escrow } from '../entity/Escrow';
import { Dispute } from '../entity/Dispute';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';
import { DisputeAIService } from '../services/disputeAIService';
import { processDisputeRefund, checkRefundEligibility } from '../services/refundService';
import { v4 as uuidv4 } from 'uuid';
import contractInstance from "../contractInstance";

// Get user's disputes list
export const getUserDisputes = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const disputeRepo = ormconfig.getRepository(Dispute);
    
    const disputes = await disputeRepo.find({
      where: { raisedBy: { id: userId } },
      relations: ['escrow', 'escrow.payment', 'raisedBy'],
      order: { created_at: 'DESC' }
    });

    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      reason: dispute.reason,
      details: dispute.details,
      status: dispute.status,
      evidence_url: dispute.evidence_url,
      created_at: dispute.created_at,
      updated_at: dispute.updated_at,
      escrow: {
        id: dispute.escrow.id,
        payment_id: dispute.escrow.payment?.id || null,
        amount: dispute.escrow.custody_amount,
        status: dispute.escrow.status,
        payment: dispute.escrow.payment ? {
          id: dispute.escrow.payment.id,
          amount: dispute.escrow.payment.amount,
          status: dispute.escrow.payment.status,
          description: dispute.escrow.payment.description,
          created_at: dispute.escrow.payment.created_at
        } : null
      },
      raisedBy: {
        id: dispute.raisedBy.id,
        name: dispute.raisedBy.full_name,
        email: dispute.raisedBy.email
      }
    }));

    res.json(formattedDisputes);
  } catch (error: any) {
    console.error('Error fetching user disputes:', error);
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

// User raises a dispute
export const raiseDispute = async (req: Request, res: Response): Promise<void> => {
  const { escrowId } = req.params;
  const { reason, details, evidence } = req.body;
  const userId = (req as any).user?.id;
  if (!reason || !details) {
    res.status(400).json({ error: "Reason and details are required." });
    return;
  }
  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputeRepo = ormconfig.getRepository(Dispute);
  const userRepo = ormconfig.getRepository(User);

  const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) }, relations: ['payment'] });
  if (!escrow) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let contractTxHash = null;
  if (escrow.smart_contract_escrow_id) {
    try {
      const platformWallet = process.env.ESCROW_CONTRACT_ADDRESS;
      if (!platformWallet) {
        throw new Error("Platform wallet address not configured.");
      }
      const tx = await contractInstance.raiseDispute(escrow.smart_contract_escrow_id, { from: platformWallet });
      await tx.wait();
      contractTxHash = tx.hash;
    } catch (err) {
      console.error('Failed to call smart contract for dispute:', err);
      // Non-fatal, we can proceed with off-chain dispute
    }
  }

  const dispute = disputeRepo.create({
    escrow,
    raisedBy: user,
    reason,
    details,
    evidence_url: evidence || undefined,
    status: "pending",
    contract_dispute_raised_tx: contractTxHash || undefined,
  });
  await disputeRepo.save(dispute);

  escrow.dispute_status = "pending";
  escrow.dispute_reason = reason;
  escrow.dispute_details = details;
  escrow.dispute_evidence = evidence || null;
  escrow.dispute_history = [
    ...(escrow.dispute_history || []),
    { action: "raised", by: userId, reason, details, evidence, at: new Date() }
  ];
  await escrowRepo.save(escrow);

  // Send dispute notification email
  try {
    const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
    const recipients = [];
    
    if (escrow.payment?.payer_email) {
      recipients.push({ email: escrow.payment.payer_email, role: 'payer' });
    }
    if (escrow.payment?.recipient_email) {
      recipients.push({ email: escrow.payment.recipient_email, role: 'seller' });
    }
    
    if (recipients.length > 0) {
      await sendPaymentEventNotification({
        eventType: 'dispute_started',
        paymentId: escrow.payment?.id?.toString() || escrowId,
        paymentDetails: {
          amount: escrow.payment?.amount || escrow.custody_amount,
          currency: escrow.payment?.currency || 'MXN',
          description: escrow.payment?.description || 'Disputa iniciada',
          status: 'disputed',
          payer_email: escrow.payment?.payer_email,
          recipient_email: escrow.payment?.recipient_email,
          disputeReason: reason,
          disputeDetails: details,
          escrowId: escrow.id
        },
        recipients
      });
      console.log(`📧 Dispute ${dispute.id} created - email notifications sent`);
    }
  } catch (emailError) {
    console.error(`⚠️ Failed to send dispute email notifications for escrow ${escrowId}:`, emailError);
  }

  res.json({ success: true, message: "Dispute submitted.", dispute: { status: escrow.dispute_status } });
}

// Get dispute timeline
export const getDisputeTimeline = async (req: Request, res: Response): Promise<void> => {
  const { escrowId } = req.params;
  const escrowRepo = ormconfig.getRepository(Escrow);
  const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) } });
  if (!escrow) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }
  res.json({ timeline: escrow.dispute_history || [] });
}

// Admin resolves dispute
export const adminResolveDispute = async (req: Request, res: Response): Promise<void> => {
  const { escrowId } = req.params;
  const { resolution, adminNotes } = req.body;
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
    return;
  }

  if (!resolution || (resolution !== 'approved' && resolution !== 'dismissed')) {
    res.status(400).json({ error: 'Invalid resolution. Must be "approved" or "dismissed".' });
    return;
  }

  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputeRepo = ormconfig.getRepository(Dispute);

  try {
    const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) }, relations: ['payment'] });
    if (!escrow) {
      res.status(404).json({ error: 'Escrow not found' });
      return;
    }

    const dispute = await disputeRepo.findOne({ where: { escrow: { id: Number(escrowId) } }, order: { created_at: 'DESC' } });
    if (!dispute) {
      res.status(404).json({ error: 'Dispute not found for this escrow' });
      return;
    }

    let contractTxHash = `0x_fake_admin_resolve_tx_${uuidv4()}`;
    console.log(`[ADMIN ACTION] Admin ${user.full_name} (ID: ${user.id}) is resolving dispute for escrow ${escrow.id} with resolution: ${resolution}`);

    const adminActor = { id: user.id, name: user.full_name };

    if (resolution === "approved") {
      escrow.dispute_status = "approved";
      dispute.status = "resolved_favor_buyer";
      dispute.admin_notes = adminNotes;
      dispute.contract_dispute_resolved_tx = contractTxHash;
      escrow.dispute_history = [
        ...(escrow.dispute_history || []),
        { action: "approved", by: { type: 'admin', ...adminActor }, notes: adminNotes, contractTxHash, at: new Date() }
      ];

      const payment = escrow.payment;
      if (payment) {
        try {
          const eligibility = await checkRefundEligibility(payment.id);
          if (eligibility.eligible) {
            const refundResult = await processDisputeRefund(payment.id);
            console.log(`💰 [DISPUTE REFUND] Completed: ${refundResult.txHash}`);
            escrow.dispute_history = [
              ...(escrow.dispute_history || []),
              {
                action: "refund_processed",
                by: "system",
                notes: `Refund of $${refundResult.amount} processed to ${refundResult.beneficiary}`,
                contractTxHash: refundResult.txHash,
                at: new Date()
              }
            ];
          } else {
            console.warn(`⚠️ [DISPUTE REFUND] Payment ${payment.id} not eligible: ${eligibility.reason}`);
          }
        } catch (refundError: any) {
          console.error(`❌ [DISPUTE REFUND] Failed for payment ${payment.id}:`, refundError);
          escrow.dispute_history = [
            ...(escrow.dispute_history || []),
            { action: "refund_failed", by: "system", notes: `Refund failed: ${refundError?.message || 'Unknown error'}`, at: new Date() }
          ];
        }
      }
    } else if (resolution === "dismissed") {
      escrow.dispute_status = "dismissed";
      dispute.status = "dismissed";
      dispute.admin_notes = adminNotes;
      dispute.contract_dispute_resolved_tx = contractTxHash;
      escrow.dispute_history = [
        ...(escrow.dispute_history || []),
        { action: "dismissed", by: { type: 'admin', ...adminActor }, notes: adminNotes, contractTxHash, at: new Date() }
      ];
    }

    await disputeRepo.save(dispute);
    await escrowRepo.save(escrow);
    res.json({ success: true, status: escrow.dispute_status, contractTxHash });
  } catch (error: any) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ error: 'Failed to resolve dispute: ' + error.message });
  }
}

// Get AI risk assessment for a dispute
export const getDisputeRiskAssessment = async (req: Request, res: Response): Promise<void> => {
  const { disputeId } = req.params;
  const userRole = (req as any).user?.role;
  
  if (userRole !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
    return;
  }

  try {
    const aiService = new DisputeAIService();
    const assessment = await aiService.analyzeDispute(Number(disputeId));
    res.json(assessment);
  } catch (error: any) {
    console.error('Error generating AI risk assessment:', error);
    res.status(500).json({ error: 'Failed to generate risk assessment: ' + error.message });
  }
};

// Get AI risk assessments for multiple disputes (batch)
export const getBatchDisputeRiskAssessments = async (req: Request, res: Response): Promise<void> => {
  const { disputeIds } = req.body;
  const userRole = (req as any).user?.role;
  
  if (userRole !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
    return;
  }

  if (!Array.isArray(disputeIds) || disputeIds.length === 0) {
    res.status(400).json({ error: 'disputeIds array is required' });
    return;
  }

  try {
    const aiService = new DisputeAIService();
    const assessments = await aiService.batchAnalyzeDisputes(disputeIds);
    res.json(assessments);
  } catch (error: any) {
    console.error('Error generating batch AI risk assessments:', error);
    res.status(500).json({ error: 'Failed to generate risk assessments: ' + error.message });
  }
};
