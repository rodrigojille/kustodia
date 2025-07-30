"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAutomationService = void 0;
const paymentService_1 = require("./paymentService");
const escrowService_1 = require("./escrowService");
const junoService_1 = require("./junoService");
const paymentNotificationIntegration_1 = require("./paymentNotificationIntegration");
const paymentNotificationService_1 = require("../utils/paymentNotificationService");
const typeorm_1 = require("typeorm");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const PaymentEvent_1 = require("../entity/PaymentEvent");
const cron = __importStar(require("node-cron"));
const dotenv = __importStar(require("dotenv"));
const node_crypto_1 = require("node:crypto");
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
dotenv.config();
class PaymentAutomationService {
    constructor() {
        this.paymentService = new paymentService_1.PaymentService();
        // Initialize Juno service to set up API credentials
        (0, junoService_1.initializeJunoService)();
    }
    /**
     * Initialize all automation processes
     */
    async startAutomation() {
        console.log('🤖 Iniciando servicios de automatización de pagos...');
        // Every minute: Check for deposits and process payments
        cron.schedule('* * * * *', async () => {
            await this.processNewDeposits();
        });
        // Every 10 minutes: Release expired custodies
        cron.schedule('*/10 * * * *', async () => {
            await this.releaseExpiredCustodies();
        });
        // Every 2 minutes: Process payouts for released escrows
        cron.schedule('*/2 * * * *', async () => {
            await this.processPendingPayouts();
        });
        console.log('✅ Automatización iniciada exitosamente');
    }
    /**
     * AUTOMATION 1: Detect new deposits and trigger payment processing
     */
    async processNewDeposits() {
        try {
            // console.log('🔍 Revisando nuevos depósitos SPEI...');
            if (!ormconfig_1.default.isInitialized) {
                console.warn('⚠️ Database not initialized, skipping deposit processing');
                return;
            }
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            const pendingPayments = await paymentRepo.find({
                where: { status: 'pending' },
                relations: ['user', 'seller', 'escrow'],
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    deposit_clabe: true,
                    reference: true,
                    transaction_id: true,
                    user: {
                        id: true,
                        email: true,
                        full_name: true,
                    },
                    seller: {
                        id: true,
                        email: true,
                        full_name: true,
                        payout_clabe: true,
                        juno_bank_account_id: true
                    },
                    escrow: {
                        id: true
                    }
                }
            });
            if (pendingPayments.length === 0) {
                return;
            }
            const junoTransactions = await (0, junoService_1.listJunoTransactions)();
            let processedCount = 0;
            for (const payment of pendingPayments) {
                const matchingDeposit = junoTransactions.find((tx) => {
                    const depositAmount = Number(tx.amount);
                    const paymentAmount = Number(payment.amount);
                    const statusMatch = tx.status === 'complete';
                    const amountMatch = depositAmount === paymentAmount;
                    const clabeMatch = tx.receiver_clabe === payment.deposit_clabe;
                    return statusMatch && amountMatch && clabeMatch;
                });
                if (matchingDeposit && !payment.reference) {
                    try {
                        await ormconfig_1.default.transaction(async (manager) => {
                            const paymentRepo = manager.getRepository(Payment_1.Payment);
                            const eventRepo = manager.getRepository(PaymentEvent_1.PaymentEvent);
                            const paymentToUpdate = await paymentRepo.findOne({
                                where: { id: payment.id, status: 'pending' },
                                lock: { mode: 'pessimistic_write' }
                            });
                            if (paymentToUpdate) {
                                paymentToUpdate.status = 'funded';
                                paymentToUpdate.reference = matchingDeposit.fid;
                                paymentToUpdate.transaction_id = matchingDeposit.deposit_id;
                                await paymentRepo.save(paymentToUpdate);
                                const event = new PaymentEvent_1.PaymentEvent();
                                event.payment = paymentToUpdate;
                                event.type = 'deposito_detectado';
                                event.description = `Depósito SPEI detectado con FID: ${matchingDeposit.fid}`;
                                await eventRepo.save(event);
                                console.log(`✅ Payment ${payment.id} updated to 'funded' with reference ${matchingDeposit.fid}`);
                            }
                            else {
                                console.log(`⏩ Payment ${payment.id} was already processed. Skipping.`);
                                return;
                            }
                        });
                        // Create payment funded notification
                        try {
                            await (0, paymentNotificationIntegration_1.createPaymentNotifications)(payment.id, 'funds_received');
                            console.log(`📧 Payment ${payment.id} funded - notifications sent`);
                        }
                        catch (notificationError) {
                            console.error(`⚠️ Failed to send notifications for payment ${payment.id}:`, notificationError);
                        }
                        processedCount++;
                        await this.processPaymentAutomation(payment.id);
                    }
                    catch (transactionError) {
                        console.error(`❌ Error processing payment ${payment.id}:`, transactionError);
                    }
                }
            }
            if (processedCount > 0) {
                console.log(`🎉 ${processedCount} new deposits processed into payments.`);
            }
        }
        catch (error) {
            console.error('❌ Error in processNewDeposits:', error.message);
        }
    }
    /**
     * Complete payment automation flow after funding
     */
    async processPaymentAutomation(paymentId) {
        try {
            console.log(`🚀 Starting automation for payment ${paymentId}`);
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ['escrow', 'user', 'seller'] });
            if (!payment)
                throw new Error(`Payment ${paymentId} not found`);
            if (payment.status !== 'funded')
                throw new Error(`Payment ${paymentId} not in 'funded' status`);
            const totalAmount = Number(payment.amount);
            const custodyPercent = payment.escrow?.custody_percent || 0;
            const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
            const payoutAmount = totalAmount - custodyAmount;
            if (payoutAmount > 0)
                await this.processSellerRedemption(payment, payoutAmount);
            if (custodyAmount > 0) {
                await this.processBridgeWithdrawal(payment, custodyAmount);
                await this.processEscrowCreationAndFunding(payment, custodyAmount);
            }
        }
        catch (error) {
            console.error(`❌ Automation failed for payment ${paymentId}:`, error.message);
            await this.paymentService.logPaymentEvent(paymentId, 'automation_error', `Automation failed: ${error.message}`);
        }
    }
    /**
     * Get escrow status from smart contract
     */
    async getEscrowContractStatus(escrowId) {
        try {
            // This would query the smart contract to get the actual on-chain status
            // For now, we'll implement a basic version that can be enhanced
            console.log(`🔍 Checking contract status for escrow ${escrowId}`);
            // TODO: Implement actual smart contract status query
            // This should call the escrow contract to get the actual status
            // For now, return null to indicate no status change needed
            return null;
        }
        catch (error) {
            console.error(`❌ Error getting contract status for escrow ${escrowId}:`, error.message);
            return null;
        }
    }
    /**
     * Process SPEI redemption to seller
     */
    async processSellerRedemption(payment, amount) {
        try {
            // Step 1: Transfer MXNB from bridge wallet to Juno wallet
            console.log(`💸 Transferring ${amount} MXNB from bridge wallet to Juno wallet...`);
            const bridgeTransferTxHash = await this.transferBridgeToJuno(amount);
            await this.paymentService.logPaymentEvent(payment.id, 'bridge_to_juno_transfer', `Transferred ${amount} MXNB from bridge wallet to Juno wallet. TX: ${bridgeTransferTxHash}`, false);
            console.log(`✅ Bridge to Juno transfer completed for payment ${payment.id}`);
            // Step 2: Wait a moment for transaction confirmation
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Step 3: Process SPEI redemption
            console.log(`🏦 Processing SPEI redemption for payment ${payment.id}...`);
            // Get the seller's bank account for redemption
            if (!payment.seller) {
                throw new Error(`Payment ${payment.id} has no seller associated`);
            }
            if (!payment.seller.juno_bank_account_id) {
                throw new Error(`Seller ${payment.seller.email} has no registered bank account`);
            }
            const bankAccounts = await (0, junoService_1.getRegisteredBankAccounts)();
            const destinationBankAccount = bankAccounts.find(account => account.id === payment.seller.juno_bank_account_id);
            if (!destinationBankAccount) {
                throw new Error(`Seller's bank account ${payment.seller.juno_bank_account_id} not found in registered accounts`);
            }
            const redemptionResult = await (0, junoService_1.redeemMXNBToMXN)(amount, destinationBankAccount.id);
            await this.paymentService.logPaymentEvent(payment.id, 'spei_redemption_initiated', `SPEI redemption of ${amount} MXN to ${destinationBankAccount.clabe}. Tx ID: ${redemptionResult.id}`, false);
            console.log(`✅ SPEI redemption initiated for payment ${payment.id}`);
        }
        catch (error) {
            console.error(`❌ Seller redemption failed for payment ${payment.id}:`, error.message);
            throw error;
        }
    }
    /**
     * Process MXNB withdrawal to bridge wallet with enhanced error handling
     */
    async processBridgeWithdrawal(payment, amount) {
        const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
        if (!bridgeWallet)
            throw new Error('ESCROW_BRIDGE_WALLET not set in .env');
        try {
            console.log(`🔄 Starting bridge withdrawal for payment ${payment.id}: ${amount} MXNB to ${bridgeWallet}`);
            const withdrawalResult = await (0, junoService_1.withdrawMXNBToBridge)(amount, bridgeWallet);
            await this.paymentService.logPaymentEvent(payment.id, 'bridge_withdrawal_success', `Retiro de ${amount} MXNB a billetera puente completado exitosamente. ID de retiro: ${withdrawalResult?.id || 'N/A'}`, true);
            console.log(`✅ Bridge withdrawal for payment ${payment.id} completed successfully`);
            console.log(`📋 Withdrawal details:`, withdrawalResult);
        }
        catch (error) {
            console.error(`❌ Bridge withdrawal failed for payment ${payment.id}:`, error.message);
            // Log the error but check if withdrawal might have succeeded anyway
            await this.paymentService.logPaymentEvent(payment.id, 'bridge_withdrawal_error', `Withdrawal error: ${error.message}. Verifying if withdrawal was processed...`, false);
            // Give some time for potential processing
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Verify if withdrawal was actually processed despite the error
            console.log(`🔍 Verifying if withdrawal was actually processed for payment ${payment.id}...`);
            const verifiedWithdrawal = await (0, junoService_1.verifyWithdrawalProcessed)(amount, bridgeWallet, 10);
            if (verifiedWithdrawal) {
                console.log(`✅ Withdrawal verification successful for payment ${payment.id} - withdrawal was processed despite error`);
                await this.paymentService.logPaymentEvent(payment.id, 'bridge_withdrawal_verified', `Withdrawal verified as successful despite initial error. Withdrawal ID: ${verifiedWithdrawal.id || 'N/A'}`, true);
                // Don't throw error since withdrawal was successful
                return;
            }
            else {
                console.log(`❌ Withdrawal verification failed for payment ${payment.id} - withdrawal was not processed`);
                await this.paymentService.logPaymentEvent(payment.id, 'bridge_withdrawal_failed', `Withdrawal failed and could not be verified: ${error.message}`, false);
                throw error;
            }
        }
    }
    /**
     * Create and fund the escrow contract after bridge withdrawal
     * Flow 1: Both payer and payee are bridge wallet (platform-managed custody)
     */
    async processEscrowCreationAndFunding(payment, custodyAmount) {
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const tokenAddress = process.env.MXNB_CONTRACT_ADDRESS;
        const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
        if (!payment.escrow)
            throw new Error(`Payment ${payment.id} missing escrow relation`);
        if (!payment.escrow.custody_end)
            throw new Error(`Payment ${payment.id} escrow missing custody_end date`);
        // Calculate deadline with proper timezone handling
        // The issue: custody_end from DB is in local timezone but getTime() treats it as UTC
        let deadline;
        // Get current time for comparison
        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Calculate the original deadline accounting for timezone
        const custodyEndTimestamp = Math.floor(payment.escrow.custody_end.getTime() / 1000);
        console.log(`[escrow] Payment ${payment.id} deadline analysis:`);
        console.log(`   Custody End DB: ${payment.escrow.custody_end}`);
        console.log(`   Custody End Timestamp: ${custodyEndTimestamp}`);
        console.log(`   Current Timestamp: ${currentTimestamp}`);
        console.log(`   Original deadline in future: ${custodyEndTimestamp > currentTimestamp}`);
        if (custodyEndTimestamp <= currentTimestamp) {
            // Deadline has passed, set a new future deadline
            const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
            deadline = Math.floor(futureDate.getTime() / 1000);
            console.log(`[escrow] Original deadline passed, setting new deadline: ${futureDate.toISOString()}`);
        }
        else {
            // Use the original deadline
            deadline = custodyEndTimestamp;
            console.log(`[escrow] Using original deadline: ${new Date(deadline * 1000).toISOString()}`);
        }
        try {
            // Flow 1: Both payer and payee are bridge wallet (platform manages custody)
            const createResult = await (0, escrowService_1.createEscrow)({
                payer: bridgeWallet,
                payee: bridgeWallet, // Flow 1: Bridge wallet manages custody for both parties
                token: tokenAddress,
                amount: custodyAmount.toString(),
                deadline: deadline,
                vertical: payment.vertical_type || '',
                clabe: payment.deposit_clabe || '',
                conditions: 'Flow 1: Platform-managed custody'
            });
            if (!createResult?.escrowId)
                throw new Error('Escrow creation failed to return a valid ID.');
            payment.escrow.smart_contract_escrow_id = createResult.escrowId;
            payment.escrow.blockchain_tx_hash = createResult.txHash;
            payment.escrow.status = 'active';
            payment.status = 'escrowed';
            await escrowRepo.save(payment.escrow);
            await paymentRepo.save(payment);
            await this.paymentService.logPaymentEvent(payment.id, 'escrow_created', `Custodia ${createResult.escrowId} creada en blockchain. Tx: ${createResult.txHash}`, true);
            // Create escrow created notification
            try {
                await (0, paymentNotificationIntegration_1.createPaymentNotifications)(payment.id, 'escrow_created');
                console.log(`📧 Payment ${payment.id} escrow created - notifications sent`);
            }
            catch (notificationError) {
                console.error(`⚠️ Failed to send escrow created notifications for payment ${payment.id}:`, notificationError);
            }
            console.log(`✅ Escrow ${createResult.escrowId} created and payment ${payment.id} updated to 'escrowed'`);
        }
        catch (error) {
            console.error(`❌ Escrow creation failed for payment ${payment.id}:`, error.message);
            await this.paymentService.logPaymentEvent(payment.id, 'escrow_error', `Error al crear custodia: ${error.message}`, true);
            throw error;
        }
    }
    /**
     * Process Juno withdrawals to bridge wallet for escrow funding (DEPRECATED - logic moved)
     */
    async processJunoWithdrawals() { }
    /**
     * Release expired custodies
     */
    async releaseExpiredCustodies() {
        try {
            console.log('🔍 Checking for expired custodies to release...');
            if (!ormconfig_1.default.isInitialized) {
                console.warn('⚠️ Database not initialized, skipping custody release');
                return;
            }
            const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
            const now = new Date();
            // Find escrows ready for release:
            // 1. Traditional payments: funded/active and past deadline
            // 2. Nuevo flujo with dual approval: immediate release (ignore deadline)
            // 3. Nuevo flujo without dual approval: BLOCK release even after deadline
            // IMPORTANT: Only process escrows that haven't been released yet
            const expiredEscrows = await escrowRepo.find({
                where: [
                    {
                        status: (0, typeorm_1.In)(['funded', 'active']), // Not 'released'
                        release_tx_hash: (0, typeorm_1.IsNull)(), // No existing release transaction
                        custody_end: (0, typeorm_1.LessThan)(now),
                        payment: {
                            payment_type: (0, typeorm_1.Not)('nuevo_flujo') // Traditional payments only
                        }
                    },
                    {
                        status: (0, typeorm_1.In)(['funded', 'active']), // Not 'released'
                        release_tx_hash: (0, typeorm_1.IsNull)(), // No existing release transaction
                        payment: {
                            payment_type: 'nuevo_flujo',
                            payer_approval: true,
                            payee_approval: true
                        }
                    }
                ],
                relations: ['payment']
            });
            console.log(`📋 Found ${expiredEscrows.length} expired escrows to process`);
            for (const escrow of expiredEscrows) {
                try {
                    // Check if payment relation exists
                    if (!escrow.payment) {
                        console.error(`❌ Escrow ${escrow.id} has no payment relation, skipping`);
                        continue;
                    }
                    // Handle nuevo_flujo vs traditional payment logic
                    if (escrow.payment.payment_type === 'nuevo_flujo') {
                        // For nuevo_flujo: Only release if dual approval is complete
                        if (!escrow.payment.payer_approval || !escrow.payment.payee_approval) {
                            console.log(`⏳ Nuevo flujo escrow ${escrow.id} waiting for dual approval`);
                            continue;
                        }
                        console.log(`🚀 Dual approval complete for Payment ${escrow.payment.id}, releasing immediately`);
                    }
                    else {
                        // For traditional payments: Release based on deadline only
                        console.log(`⏰ Traditional payment ${escrow.payment.id} deadline expired, releasing`);
                    }
                    console.log(`🔓 Releasing escrow ${escrow.id} for payment ${escrow.payment.id}`);
                    // Validate escrow is actually funded on-chain before attempting release
                    if (!escrow.smart_contract_escrow_id) {
                        console.error(`❌ Escrow ${escrow.id} has no smart contract ID, skipping`);
                        continue;
                    }
                    console.log(`🔍 Validating on-chain funding for escrow ID ${escrow.smart_contract_escrow_id}`);
                    // Call smart contract release function
                    console.log(`🔗 Calling smart contract release for escrow ID ${escrow.smart_contract_escrow_id}`);
                    const releaseTxHash = await (0, escrowService_1.releaseEscrow)(Number(escrow.smart_contract_escrow_id));
                    // Update escrow status to released and store transaction hash
                    escrow.status = 'released';
                    escrow.release_tx_hash = releaseTxHash;
                    await escrowRepo.save(escrow);
                    // Log the release event with transaction hash
                    await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_success', `Custodia ${escrow.smart_contract_escrow_id} liberada del contrato. Tx: ${releaseTxHash}`, true);
                    // Create escrow release notification
                    try {
                        await (0, paymentNotificationIntegration_1.createPaymentNotifications)(escrow.payment.id, 'payment_released');
                        console.log(`📧 Payment ${escrow.payment.id} escrow released - in-app notifications sent`);
                    }
                    catch (notificationError) {
                        console.error(`⚠️ Failed to send escrow release in-app notifications for payment ${escrow.payment.id}:`, notificationError);
                    }
                    // Send email notification for escrow release
                    try {
                        const recipients = [];
                        if (escrow.payment.payer_email) {
                            recipients.push({ email: escrow.payment.payer_email, role: 'payer' });
                        }
                        if (escrow.payment.recipient_email) {
                            recipients.push({ email: escrow.payment.recipient_email, role: 'seller' });
                        }
                        if (recipients.length > 0) {
                            await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                                eventType: 'payment_released',
                                paymentId: escrow.payment.id.toString(),
                                paymentDetails: {
                                    amount: escrow.payment.amount,
                                    description: escrow.payment.description,
                                    payer_email: escrow.payment.payer_email,
                                    recipient_email: escrow.payment.recipient_email
                                },
                                recipients
                            });
                        }
                        console.log(`📧 Payment ${escrow.payment.id} escrow released - email notifications sent`);
                    }
                    catch (emailError) {
                        console.error(`⚠️ Failed to send escrow release email notifications for payment ${escrow.payment.id}:`, emailError);
                    }
                    console.log(`✅ Escrow ${escrow.id} released successfully.`);
                }
                catch (error) {
                    console.error(`❌ Failed to release escrow ${escrow.id}:`, error.message);
                    // Only try to log payment event if payment exists
                    if (escrow.payment) {
                        await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_error', `Failed to release escrow ${escrow.id}: ${error.message}`, true);
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ Error in releaseExpiredCustodies:', error.message);
        }
    }
    /**
     * Process payouts for released escrows
     */
    async processPendingPayouts() {
        try {
            console.log('💸 Processing pending payouts...');
            if (!ormconfig_1.default.isInitialized) {
                console.warn('⚠️ Database not initialized, skipping payout processing');
                return;
            }
            const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            // Find escrows that are released and need payout processing
            const releasedEscrows = await escrowRepo.find({
                where: {
                    status: 'released'
                },
                relations: ['payment', 'payment.seller']
            });
            console.log(`📋 Found ${releasedEscrows.length} released escrows to process`);
            for (const escrow of releasedEscrows) {
                try {
                    const payment = escrow.payment;
                    // Skip if payment is already completed or in processing
                    if (payment.status === 'completed' || payment.status === 'processing') {
                        continue;
                    }
                    console.log(`💰 Processing payout for payment ${payment.id}`);
                    // Update status to processing to prevent duplicate processing
                    payment.status = 'processing';
                    await paymentRepo.save(payment);
                    // Calculate the payout amount (escrow custody amount)
                    const custodyAmount = Number(escrow.custody_amount);
                    // Process the seller redemption (MXNB -> MXN -> SPEI)
                    try {
                        await this.processSellerRedemption(payment, custodyAmount);
                        // Update payment and escrow status to completed
                        payment.status = 'completed';
                        escrow.status = 'completed';
                        await paymentRepo.save(payment);
                        await escrowRepo.save(escrow);
                        // Log the completion event
                        await this.paymentService.logPaymentEvent(payment.id, 'payout_completed', `Pago completado exitosamente. SPEI enviado al beneficiario.`, true);
                        // Create payment completion notification
                        try {
                            await (0, paymentNotificationIntegration_1.createPaymentNotifications)(payment.id, 'payout_completed');
                            console.log(`📧 Payment ${payment.id} completed - in-app notifications sent`);
                        }
                        catch (notificationError) {
                            console.error(`⚠️ Failed to send payment completion in-app notifications for payment ${payment.id}:`, notificationError);
                        }
                        // Send email notification for payment completion
                        try {
                            const recipients = [];
                            if (payment.payer_email) {
                                recipients.push({ email: payment.payer_email, role: 'payer' });
                            }
                            if (payment.recipient_email) {
                                recipients.push({ email: payment.recipient_email, role: 'seller' });
                            }
                            if (recipients.length > 0) {
                                await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                                    eventType: 'payout_completed',
                                    paymentId: payment.id.toString(),
                                    paymentDetails: {
                                        amount: payment.amount,
                                        description: payment.description,
                                        payer_email: payment.payer_email,
                                        recipient_email: payment.recipient_email
                                    },
                                    recipients
                                });
                            }
                            console.log(`📧 Payment ${payment.id} completed - email notifications sent`);
                        }
                        catch (emailError) {
                            console.error(`⚠️ Failed to send payment completion email notifications for payment ${payment.id}:`, emailError);
                        }
                        console.log(`✅ Payout completed for payment ${payment.id}`);
                    }
                    catch (redemptionError) {
                        // Reset status back to funded for retry
                        payment.status = 'funded';
                        await paymentRepo.save(payment);
                        // Properly format error message
                        const errorMessage = redemptionError.message || JSON.stringify(redemptionError) || 'Unknown error';
                        // Log the error
                        await this.paymentService.logPaymentEvent(payment.id, 'payout_error', `Pago fallido: ${errorMessage}`, true);
                        console.error(`❌ Payout failed for payment ${payment.id}:`, errorMessage);
                        console.error('Full error object:', redemptionError);
                    }
                }
                catch (error) {
                    console.error(`❌ Failed to process payout for escrow ${escrow.id}:`, error.message);
                    // Reset payment status for retry if it was set to processing
                    if (escrow.payment.status === 'processing') {
                        escrow.payment.status = 'funded';
                        await paymentRepo.save(escrow.payment);
                    }
                    await this.paymentService.logPaymentEvent(escrow.payment.id, 'payout_processing_error', `Error al procesar pago para custodia ${escrow.id}: ${error.message}`, true);
                }
            }
        }
        catch (error) {
            console.error('❌ Error in processPendingPayouts:', error.message);
        }
    }
    /**
     * Sync blockchain statuses with database
     */
    async syncBlockchainStatuses() {
        try {
            console.log('⛓️ Syncing blockchain statuses with database...');
            if (!ormconfig_1.default.isInitialized) {
                console.warn('⚠️ Database not initialized, skipping blockchain sync');
                return;
            }
            const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            // Find escrows that have smart contract IDs but need status verification
            const activeEscrows = await escrowRepo.find({
                where: [
                    { status: 'funded', smart_contract_escrow_id: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
                    { status: 'active', smart_contract_escrow_id: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) }
                ],
                relations: ['payment']
            });
            console.log(`📋 Found ${activeEscrows.length} escrows to sync with blockchain`);
            for (const escrow of activeEscrows) {
                try {
                    if (!escrow.smart_contract_escrow_id)
                        continue;
                    const escrowId = Number(escrow.smart_contract_escrow_id);
                    console.log(`🔍 Checking blockchain status for escrow ${escrow.id} (contract ID: ${escrowId})`);
                    // Get escrow status from smart contract
                    const contractStatus = await this.getEscrowContractStatus(escrowId);
                    // Update local status if it differs from blockchain
                    if (contractStatus && contractStatus !== escrow.status) {
                        console.log(`📝 Updating escrow ${escrow.id} status: ${escrow.status} -> ${contractStatus}`);
                        escrow.status = contractStatus;
                        await escrowRepo.save(escrow);
                        // Update payment status if needed
                        if (contractStatus === 'released' && escrow.payment.status === 'funded') {
                            escrow.payment.status = 'custody_released';
                            await paymentRepo.save(escrow.payment);
                        }
                        // Log the sync event
                        await this.paymentService.logPaymentEvent(escrow.payment.id, 'blockchain_sync', `Escrow ${escrow.id} status synced from blockchain: ${contractStatus}`, true);
                    }
                }
                catch (error) {
                    console.error(`❌ Failed to sync escrow ${escrow.id}:`, error.message);
                    await this.paymentService.logPaymentEvent(escrow.payment.id, 'blockchain_sync_error', `Failed to sync escrow ${escrow.id}: ${error.message}`, true);
                }
            }
            console.log('✅ Blockchain synchronization completed');
        }
        catch (error) {
            console.error('❌ Error in syncBlockchainStatuses:', error.message);
        }
    }
    /**
     * Trigger automatic payout after escrow release
     */
    async triggerAutomaticPayout(paymentId) {
        console.log(`🚀 Payout automático programado para pago ${paymentId}`);
    }
    stopAutomation() {
        console.log('🛑 Deteniendo automatización de pagos...');
        // Note: node-cron doesn't have a built-in stop all, 
        // but we can implement flags to disable processing
    }
    async withdrawFromJunoToBridge(amount) {
        const JUNO_ENV = process.env.JUNO_ENV || 'stage';
        const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
        const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
        const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
        const DESTINATION_ADDRESS = process.env.ESCROW_BRIDGE_WALLET;
        const endpoint = '/mint_platform/v1/crypto_withdrawals';
        const url = `${BASE_URL}${endpoint}`;
        const bodyObj = {
            destination_address: DESTINATION_ADDRESS,
            amount: amount.toString(),
            asset: 'MXNB'
        };
        const body = JSON.stringify(bodyObj);
        const nonce = Date.now().toString();
        const method = 'POST';
        const requestPath = endpoint;
        const dataToSign = nonce + method + requestPath + body;
        const signature = (0, node_crypto_1.createHmac)('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
        const headers = {
            'X-Api-Key': JUNO_API_KEY,
            'X-Nonce': nonce,
            'X-Signature': signature
        };
        const response = await axios_1.default.post(url, bodyObj, { headers });
        console.log(`💰 Juno withdrawal successful: ${JSON.stringify(response.data)}`);
    }
    async transferBridgeToJuno(amount) {
        const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
        const BRIDGE_WALLET_PK = process.env.ESCROW_PRIVATE_KEY;
        const PROVIDER_URL = process.env.ETH_RPC_URL;
        const JUNO_WALLET = process.env.JUNO_WALLET;
        if (!BRIDGE_WALLET_PK || !JUNO_WALLET) {
            throw new Error('Missing bridge wallet private key or Juno wallet address in .env');
        }
        const provider = new ethers_1.ethers.JsonRpcProvider(PROVIDER_URL);
        const wallet = new ethers_1.ethers.Wallet(BRIDGE_WALLET_PK, provider);
        const tokenContract = new ethers_1.ethers.Contract(MXNB_TOKEN, ['function transfer(address to, uint256 amount)'], wallet);
        const decimals = 6; // MXNB uses 6 decimals, not 18!
        const amountInWei = ethers_1.ethers.parseUnits(amount.toString(), decimals);
        const tx = await tokenContract.transfer(JUNO_WALLET, amountInWei);
        await tx.wait();
        console.log(`✅ Transferred ${amount} MXNB to Juno wallet. Tx: ${tx.hash}`);
        return tx.hash;
    }
}
exports.PaymentAutomationService = PaymentAutomationService;
