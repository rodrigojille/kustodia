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
const Payment_1 = require("../entity/Payment");
const disputeAIService_1 = require("../services/disputeAIService");
// Mock payment event recorder - integrate with actual service later
const recordPaymentEvent = async (payment, type, description) => {
    console.log(`📝 [MOCK EVENT] ${type}: ${description || 'No description'} for payment ${payment.id}`);
};
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
        // Find all disputes raised by the authenticated user
        const disputes = await disputeRepo.find({
            where: { raisedBy: { id: userId } },
            relations: ['escrow', 'escrow.payment', 'raisedBy'],
            order: { created_at: 'DESC' }
        });
        // Transform data for frontend consumption
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
// User raises a dispute or reapplies before custody ends
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
        const tx = await contractInstance_1.default.raiseDispute(escrow.smart_contract_escrow_id, { from: platformWallet });
        await tx.wait();
        contractTxHash = tx.hash;
    }
    catch (err) {
        res.status(500).json({ error: "Failed to call smart contract: " + err.message });
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
    // Add PaymentEvent for dispute raised (for timeline)
    try {
        const paymentEventRepo = ormconfig_1.default.getRepository(require("../entity/PaymentEvent").PaymentEvent);
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: escrow.payment.id,
            type: 'dispute_raised',
            description: `Disputa levantada por el usuario. Motivo: ${reason}`,
        }));
    }
    catch (e) {
        // Log but don't block dispute creation
        console.error('Failed to create PaymentEvent for dispute:', e);
    }
    res.json({ success: true, message: "Dispute submitted.", dispute: { status: escrow.dispute_status } });
};
exports.raiseDispute = raiseDispute;
// Get dispute timeline/tracking (combined from Dispute entity and Escrow legacy history)
const getDisputeTimeline = async (req, res) => {
    const { escrowId } = req.params;
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
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
};
exports.getDisputeTimeline = getDisputeTimeline;
// Admin resolves dispute
const adminResolveDispute = async (req, res) => {
    const { escrowId } = req.params;
    const { resolution, adminNotes } = req.body;
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const disputeRepo = ormconfig_1.default.getRepository(Dispute_1.Dispute);
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
    // Generate transaction hash for dispute resolution tracking
    let contractTxHash = null;
    try {
        // Generate UUID-based transaction hash for tracking
        contractTxHash = `dispute_resolve_${(0, uuid_1.v4)().replace(/-/g, '')}`;
        // TODO: Replace with actual contract call when contract is deployed
        // const tx = await contract.resolveDispute(escrow.smart_contract_escrow_id, resolution === "approved");
        // await tx.wait();
        // contractTxHash = tx.hash;
        console.log(`📝 [DISPUTE RESOLVE] Generated TX hash: ${contractTxHash}`);
    }
    catch (err) {
        console.error(`❌ [DISPUTE RESOLVE] Hash generation failed:`, err);
        res.status(500).json({ error: "Failed to generate dispute resolution transaction: " + err.message });
        return;
    }
    if (resolution === "approved") {
        // Dispute approved - buyer wins, initiate refund process
        console.log(`✅ [DISPUTE APPROVED] Processing refund for escrow ${escrowId}`);
        escrow.dispute_status = "resolved";
        escrow.status = "reverted";
        dispute.status = "resolved";
        dispute.admin_notes = adminNotes;
        dispute.contract_dispute_resolved_tx = contractTxHash;
        escrow.dispute_history = [
            ...(escrow.dispute_history || []),
            { action: "approved", by: "admin", notes: adminNotes, contractTxHash, at: new Date() }
        ];
        // Get payment for refund processing
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({ where: { escrow: { id: Number(escrowId) } } });
        if (payment) {
            try {
                // Check refund eligibility
                const eligibility = await (0, refundService_1.checkRefundEligibility)(payment.id);
                if (!eligibility.eligible) {
                    console.warn(`⚠️ [DISPUTE REFUND] Payment ${payment.id} not eligible: ${eligibility.reason}`);
                }
                else {
                    // Process dispute refund to buyer
                    const refundResult = await (0, refundService_1.processDisputeRefund)(payment.id);
                    console.log(`💰 [DISPUTE REFUND] Completed: ${refundResult.txHash}`);
                    // Add refund info to dispute history
                    escrow.dispute_history.push({
                        action: "refund_processed",
                        by: "system",
                        notes: `Refund of $${refundResult.amount} processed to ${refundResult.beneficiary}`,
                        contractTxHash: refundResult.txHash,
                        at: new Date()
                    });
                }
            }
            catch (refundError) {
                console.error(`❌ [DISPUTE REFUND] Failed for payment ${payment.id}:`, refundError);
                // Continue with dispute resolution even if refund fails
                escrow.dispute_history.push({
                    action: "refund_failed",
                    by: "system",
                    notes: `Refund failed: ${refundError?.message || refundError}`,
                    contractTxHash: null,
                    at: new Date()
                });
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
            { action: "dismissed", by: "admin", notes: adminNotes, contractTxHash, at: new Date() }
        ];
    }
    await disputeRepo.save(dispute);
    await escrowRepo.save(escrow);
    res.json({ success: true, status: escrow.dispute_status, contractTxHash });
};
exports.adminResolveDispute = adminResolveDispute;
// Get AI risk assessment for a dispute
const getDisputeRiskAssessment = async (req, res) => {
    const { disputeId } = req.params;
    const userRole = req.user?.role;
    // Only admins can access AI risk assessments
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
    // Only admins can access AI risk assessments
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
