"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchDisputeRiskAssessments = exports.getDisputeRiskAssessment = exports.adminResolveDispute = exports.getDisputeTimeline = exports.raiseDispute = exports.getUserDisputes = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Escrow_1 = require("../entity/Escrow");
const Dispute_1 = require("../entity/Dispute");
const User_1 = require("../entity/User");
const disputeAIService_1 = require("../services/disputeAIService");
const refundService_1 = require("../services/refundService");
const uuid_1 = require("uuid");
const contractInstance_1 = __importDefault(require("../contractInstance"));
// Get user's disputes list
const getUserDisputes = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
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
    }
    catch (error) {
        console.error('Error fetching user disputes:', error);
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
};
exports.getUserDisputes = getUserDisputes;
// User raises a dispute
const raiseDispute = async (req, res) => {
    const { escrowId } = req.params;
    const { reason, details, evidence } = req.body;
    const userId = req.user?.id;
    if (!reason || !details) {
        res.status(400).json({ error: "Reason and details are required." });
        return;
    }
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
    const userRepo = ormconfig_1.default.getRepository(User_1.User);
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
            const tx = await contractInstance_1.default.raiseDispute(escrow.smart_contract_escrow_id, { from: platformWallet });
            await tx.wait();
            contractTxHash = tx.hash;
        }
        catch (err) {
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
    res.json({ success: true, message: "Dispute submitted.", dispute: { status: escrow.dispute_status } });
};
exports.raiseDispute = raiseDispute;
// Get dispute timeline
const getDisputeTimeline = async (req, res) => {
    const { escrowId } = req.params;
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const escrow = await escrowRepo.findOne({ where: { id: Number(escrowId) } });
    if (!escrow) {
        res.status(404).json({ error: "Escrow not found" });
        return;
    }
    res.json({ timeline: escrow.dispute_history || [] });
};
exports.getDisputeTimeline = getDisputeTimeline;
// Admin resolves dispute
const adminResolveDispute = async (req, res) => {
    const { escrowId } = req.params;
    const { resolution, adminNotes } = req.body;
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
        return;
    }
    if (!resolution || (resolution !== 'approved' && resolution !== 'dismissed')) {
        res.status(400).json({ error: 'Invalid resolution. Must be "approved" or "dismissed".' });
        return;
    }
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
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
        let contractTxHash = `0x_fake_admin_resolve_tx_${(0, uuid_1.v4)()}`;
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
                    const eligibility = await (0, refundService_1.checkRefundEligibility)(payment.id);
                    if (eligibility.eligible) {
                        const refundResult = await (0, refundService_1.processDisputeRefund)(payment.id);
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
                    }
                    else {
                        console.warn(`⚠️ [DISPUTE REFUND] Payment ${payment.id} not eligible: ${eligibility.reason}`);
                    }
                }
                catch (refundError) {
                    console.error(`❌ [DISPUTE REFUND] Failed for payment ${payment.id}:`, refundError);
                    escrow.dispute_history = [
                        ...(escrow.dispute_history || []),
                        { action: "refund_failed", by: "system", notes: `Refund failed: ${refundError?.message || 'Unknown error'}`, at: new Date() }
                    ];
                }
            }
        }
        else if (resolution === "dismissed") {
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
    }
    catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ error: 'Failed to resolve dispute: ' + error.message });
    }
};
exports.adminResolveDispute = adminResolveDispute;
// Get AI risk assessment for a dispute
const getDisputeRiskAssessment = async (req, res) => {
    const { disputeId } = req.params;
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
        return;
    }
    try {
        const aiService = new disputeAIService_1.DisputeAIService();
        const assessment = await aiService.analyzeDispute(Number(disputeId));
        res.json(assessment);
    }
    catch (error) {
        console.error('Error generating AI risk assessment:', error);
        res.status(500).json({ error: 'Failed to generate risk assessment: ' + error.message });
    }
};
exports.getDisputeRiskAssessment = getDisputeRiskAssessment;
// Get AI risk assessments for multiple disputes (batch)
const getBatchDisputeRiskAssessments = async (req, res) => {
    const { disputeIds } = req.body;
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
        return;
    }
    if (!Array.isArray(disputeIds) || disputeIds.length === 0) {
        res.status(400).json({ error: 'disputeIds array is required' });
        return;
    }
    try {
        const aiService = new disputeAIService_1.DisputeAIService();
        const assessments = await aiService.batchAnalyzeDisputes(disputeIds);
        res.json(assessments);
    }
    catch (error) {
        console.error('Error generating batch AI risk assessments:', error);
        res.status(500).json({ error: 'Failed to generate risk assessments: ' + error.message });
    }
};
exports.getBatchDisputeRiskAssessments = getBatchDisputeRiskAssessments;
