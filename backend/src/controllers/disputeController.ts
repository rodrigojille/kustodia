import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Escrow } from "../entity/Escrow";
import { Dispute } from "../entity/Dispute";
import { User } from "../entity/User";
import { ethers } from "ethers";
import contractInstance from "../contractInstance";

// User raises a dispute or reapplies before custody ends
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

  // Parse escrowId to number
  const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) } });
  if (!escrow) {
  res.status(404).json({ error: "Escrow not found" });
  return;
}
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Call smart contract to raise dispute (assume contract instance is imported)
  let contractTxHash = null;
  if (!escrow.smart_contract_escrow_id) {
    res.status(400).json({ error: "Escrow is missing smart_contract_escrow_id." });
    return;
  }
  // Use platform wallet for contract call
  try {
    // Use smart_contract_escrow_id and platform wallet (no user.wallet_address)
    const platformWallet = process.env.ESCROW_CONTRACT_ADDRESS;
    if (!platformWallet) {
      res.status(500).json({ error: "Platform wallet address not configured." });
      return;
    }
    const tx = await contractInstance.raiseDispute(
      escrow.smart_contract_escrow_id,
      { from: platformWallet }
    );
    await tx.wait();
    contractTxHash = tx.hash;
  } catch (err) {
    res.status(500).json({ error: "Failed to call smart contract: " + (err as Error).message });
    return;
  }

  // Create Dispute entity
  const dispute = disputeRepo.create({
    escrow,
    raisedBy: user,
    reason,
    details,
    evidence_url: evidence || null,
    status: "pending",
    contract_dispute_raised_tx: contractTxHash,
  });
  await disputeRepo.save(dispute);

  // Update Escrow entity for legacy/timeline support
  escrow.dispute_status = "pending";
  escrow.dispute_reason = reason;
  escrow.dispute_details = details;
  escrow.dispute_evidence = evidence || null;
  escrow.dispute_history = [
    ...(escrow.dispute_history || []),
    { action: "raised", by: userId, reason, details, evidence, at: new Date() }
  ];
  await escrowRepo.save(escrow);
  res.json({ success: true, message: "Dispute submitted.", dispute: { status: escrow.dispute_status } });
}

// Get dispute timeline/tracking (combined from Dispute entity and Escrow legacy history)
export const getDisputeTimeline = async (req: Request, res: Response): Promise<void> => {
  const { escrowId } = req.params;
  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputeRepo = ormconfig.getRepository(Dispute);
  const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) } });
  if (!escrow) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }
  // Fetch disputes for this escrow
  const disputes = await disputeRepo.find({ where: { escrow }, order: { created_at: "ASC" } });
  // Combine with legacy dispute_history for timeline
  const timeline = [
    ...(escrow.dispute_history || []),
    ...disputes.map(d => ({
      action: d.status,
      by: d.raisedBy ? d.raisedBy.id : undefined,
      reason: d.reason,
      details: d.details,
      evidence: d.evidence_url,
      adminNotes: d.admin_notes,
      contractTxHash: d.contract_dispute_raised_tx || d.contract_dispute_resolved_tx,
      at: d.created_at
    }))
  ];
  res.json({ timeline });
}

// Admin resolves dispute
export const adminResolveDispute = async (req: Request, res: Response): Promise<void> => {
  const { escrowId } = req.params;
  const { resolution, adminNotes } = req.body;
  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputeRepo = ormconfig.getRepository(Dispute);
  const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) } });
  if (!escrow) {
    res.status(404).json({ error: "Escrow not found" });
    return;
  }

  // Find latest dispute for this escrow
  const dispute = await disputeRepo.findOne({ where: { escrow }, order: { created_at: "DESC" } });
  if (!dispute) {
    res.status(404).json({ error: "Dispute not found" });
    return;
  }

  // Call smart contract to resolve dispute (assume contract instance is imported)
  let contractTxHash = null;
  try {
    // TODO: Replace with actual contract call
    // const tx = await contract.resolveDispute(escrow.blockchainId, resolution === "approved");
    // await tx.wait();
    // contractTxHash = tx.hash;
    contractTxHash = "MOCK_RESOLVE_TX_HASH";
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve dispute on smart contract: " + (err as Error).message });
    return;
  }

  if (resolution === "approved") {
    escrow.dispute_status = "resolved";
    escrow.status = "reverted";
    dispute.status = "resolved";
    dispute.admin_notes = adminNotes;
    dispute.contract_dispute_resolved_tx = contractTxHash;
    escrow.dispute_history = [
      ...(escrow.dispute_history || []),
      { action: "approved", by: "admin", notes: adminNotes, contractTxHash, at: new Date() }
    ];
  } else if (resolution === "dismissed") {
    escrow.dispute_status = "dismissed";
    dispute.status = "dismissed";
    dispute.admin_notes = adminNotes;
    dispute.contract_dispute_resolved_tx = contractTxHash;
    escrow.dispute_history = [
      ...(escrow.dispute_history || []),
      { action: "dismissed", by: "admin", notes: adminNotes, contractTxHash, at: new Date() }
    ];
  }
  await disputeRepo.save(dispute);
  await escrowRepo.save(escrow);
  res.json({ success: true, status: escrow.dispute_status, contractTxHash });
}
