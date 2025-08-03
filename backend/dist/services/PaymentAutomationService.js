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
const TransactionRouterService_1 = require("./TransactionRouterService");
const MultiSigApprovalService_1 = require("./MultiSigApprovalService");
const typeorm_1 = require("typeorm");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const User_1 = require("../entity/User");
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
        this.transactionRouter = new TransactionRouterService_1.TransactionRouterService();
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
        // Every 3 minutes: Retry failed escrow creations for funded payments
        cron.schedule('*/3 * * * *', async () => {
            await this.retryFailedEscrowCreations();
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
                                // Send funded notification email
                                try {
                                    const recipients = [];
                                    if (paymentToUpdate.payer_email) {
                                        recipients.push({
                                            email: paymentToUpdate.payer_email,
                                            role: 'payer',
                                            name: paymentToUpdate.user?.full_name || paymentToUpdate.payer_email?.split('@')[0] || 'Usuario'
                                        });
                                    }
                                    if (paymentToUpdate.recipient_email) {
                                        recipients.push({
                                            email: paymentToUpdate.recipient_email,
                                            role: 'seller',
                                            name: paymentToUpdate.seller?.full_name || 'Vendedor'
                                        });
                                    }
                                    if (recipients.length > 0) {
                                        await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                                            eventType: 'funds_received',
                                            paymentId: paymentToUpdate.id.toString(),
                                            paymentDetails: {
                                                amount: paymentToUpdate.amount,
                                                currency: paymentToUpdate.currency,
                                                description: paymentToUpdate.description,
                                                status: paymentToUpdate.status,
                                                payer_email: paymentToUpdate.payer_email,
                                                recipient_email: paymentToUpdate.recipient_email
                                            },
                                            recipients
                                        });
                                        console.log(`📧 Payment ${paymentToUpdate.id} funded - email notifications sent`);
                                    }
                                }
                                catch (emailError) {
                                    console.error(`⚠️ Failed to send funded email notifications for payment ${paymentToUpdate.id}:`, emailError);
                                }
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
            // Wait 1 minute after deposit detection for Juno to mint MXNB tokens
            console.log(`⏳ Waiting 1 minute for Juno to process deposit and mint MXNB tokens...`);
            await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay
            console.log(`✅ Wait complete - proceeding with automation`);
            const totalAmount = Number(payment.amount);
            const custodyPercent = payment.escrow?.custody_percent || 0;
            const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
            const payoutAmount = totalAmount - custodyAmount;
            let payoutSucceeded = false;
            // Try to process seller redemption (payout)
            if (payoutAmount > 0) {
                try {
                    await this.processSellerRedemption(payment, payoutAmount);
                    payoutSucceeded = true;
                    console.log(`✅ Seller payout of ${payoutAmount} MXN completed successfully`);
                }
                catch (payoutError) {
                    console.error(`❌ Seller payout failed: ${payoutError.message}`);
                    console.log(`⚠️ Payout failed - ${payoutAmount} MXN remains in Juno for manual processing`);
                    console.log(`📋 Escrow will still be created with original custody amount: ${custodyAmount} MXN`);
                    await this.paymentService.logPaymentEvent(paymentId, 'payout_failed', `Seller payout failed: ${payoutError.message}. ${payoutAmount} MXN remains in Juno. Escrow will contain ${custodyAmount} MXN as planned.`, true);
                }
            }
            // Always try to create escrow with original custody amount
            if (custodyAmount > 0) {
                try {
                    await this.processBridgeWithdrawal(payment, custodyAmount);
                    await this.processEscrowCreationAndFunding(payment, custodyAmount);
                    console.log(`✅ Escrow created with ${custodyAmount} MXN`);
                }
                catch (escrowError) {
                    console.error(`❌ Escrow creation failed: ${escrowError.message}`);
                    throw escrowError; // Re-throw to trigger retry mechanism
                }
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
     * Auto-registers bank account with Juno if missing
     * First transfers MXNB from bridge wallet to Juno, then redeems to MXN
     */
    async processSellerRedemption(payment, amount) {
        try {
            console.log(`🏦 Processing SPEI redemption for payment ${payment.id}: ${amount} MXNB -> MXN...`);
            // Get the seller's bank account for redemption
            if (!payment.seller) {
                throw new Error(`Payment ${payment.id} has no seller associated`);
            }
            // Check if seller has CLABE but no juno_bank_account_id
            if (!payment.seller.juno_bank_account_id) {
                if (!payment.seller.payout_clabe) {
                    throw new Error(`Seller ${payment.seller.email} has no CLABE registered for bank account`);
                }
                console.log(`🔄 Auto-registering bank account for seller ${payment.seller.email}...`);
                // Auto-register the seller's bank account with Juno
                try {
                    const registrationResult = await (0, junoService_1.registerBankAccount)(payment.seller.payout_clabe, payment.seller.full_name || payment.seller.email);
                    console.log(`✅ Bank account registered with Juno:`, registrationResult);
                    // Update the user's juno_bank_account_id in the database
                    const userRepository = ormconfig_1.default.getRepository(User_1.User);
                    await userRepository.update({ id: payment.seller.id }, { juno_bank_account_id: registrationResult.id });
                    // Update the payment.seller object for immediate use
                    payment.seller.juno_bank_account_id = registrationResult.id;
                    await this.paymentService.logPaymentEvent(payment.id, 'bank_account_registered', `Auto-registered bank account for ${payment.seller.email}: CLABE ${payment.seller.payout_clabe} -> Juno ID ${registrationResult.id}`, false);
                    console.log(`✅ Updated seller ${payment.seller.email} with juno_bank_account_id: ${registrationResult.payload.id}`);
                }
                catch (registrationError) {
                    console.error(`❌ Failed to register bank account for ${payment.seller.email}:`, registrationError.message);
                    throw new Error(`Bank account registration failed: ${registrationError.message}`);
                }
            }
            // STEP 1: Transfer MXNB from bridge wallet to Juno wallet
            console.log(`🌉 Step 1: Transferring ${amount} MXNB from bridge wallet to Juno...`);
            try {
                const transferTxHash = await this.transferBridgeToJuno(amount);
                await this.paymentService.logPaymentEvent(payment.id, 'bridge_to_juno_transfer', `Transferred ${amount} MXNB from bridge wallet to Juno. Tx: ${transferTxHash}`, false);
                console.log(`✅ Bridge to Juno transfer completed for payment ${payment.id}`);
            }
            catch (transferError) {
                console.error(`❌ Bridge to Juno transfer failed for payment ${payment.id}:`, transferError.message);
                throw new Error(`Bridge to Juno transfer failed: ${transferError.message}`);
            }
            // STEP 2: Get registered bank accounts and find the seller's account
            const bankAccounts = await (0, junoService_1.getRegisteredBankAccounts)();
            const destinationBankAccount = bankAccounts.find(account => account.id === payment.seller.juno_bank_account_id);
            if (!destinationBankAccount) {
                throw new Error(`Seller's bank account ${payment.seller.juno_bank_account_id} not found in registered accounts`);
            }
            // STEP 3: Process the MXNB redemption to MXN via SPEI
            console.log(`🏦 Step 2: Redeeming ${amount} MXNB to MXN via SPEI...`);
            const redemptionResult = await (0, junoService_1.redeemMXNBToMXN)(amount, destinationBankAccount.id);
            await this.paymentService.logPaymentEvent(payment.id, 'spei_redemption_initiated', `SPEI redemption of ${amount} MXNB -> MXN to ${destinationBankAccount.clabe}. Tx ID: ${redemptionResult.id}`, false);
            // Send payout completed notification
            try {
                await (0, paymentNotificationIntegration_1.createPaymentNotifications)(payment.id, 'payout_completed');
                console.log(`📧 Payment ${payment.id} payout completed - notifications sent`);
            }
            catch (notificationError) {
                console.error(`⚠️ Failed to send payout completed notifications for payment ${payment.id}:`, notificationError);
            }
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
     * Check MXNB balance in bridge wallet
     */
    async checkBridgeWalletBalance(requiredAmount) {
        try {
            const provider = new ethers_1.ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
            const tokenAddress = process.env.MXNB_CONTRACT_ADDRESS;
            const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
            const ERC20_ABI = [
                "function balanceOf(address owner) view returns (uint256)",
                "function decimals() view returns (uint8)"
            ];
            const token = new ethers_1.ethers.Contract(tokenAddress, ERC20_ABI, provider);
            const [balance, decimals] = await Promise.all([
                token.balanceOf(bridgeWallet),
                token.decimals()
            ]);
            const currentBalance = ethers_1.ethers.formatUnits(balance, decimals);
            const requiredBalance = requiredAmount.toString();
            const hasBalance = parseFloat(currentBalance) >= requiredAmount;
            console.log(`[balance] Bridge wallet MXNB balance check:`);
            console.log(`   Wallet: ${bridgeWallet}`);
            console.log(`   Current: ${currentBalance} MXNB`);
            console.log(`   Required: ${requiredBalance} MXNB`);
            console.log(`   Sufficient: ${hasBalance}`);
            return { hasBalance, currentBalance, requiredBalance };
        }
        catch (error) {
            console.error(`[balance] Error checking bridge wallet balance:`, error.message);
            return { hasBalance: false, currentBalance: '0', requiredBalance: requiredAmount.toString() };
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
        // ✅ BALANCE VERIFICATION - Check if bridge wallet has sufficient MXNB tokens
        const balanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
        if (!balanceCheck.hasBalance) {
            const errorMsg = `Insufficient MXNB balance in bridge wallet. Required: ${balanceCheck.requiredBalance} MXNB, Available: ${balanceCheck.currentBalance} MXNB`;
            console.log(`[escrow] ⏳ ${errorMsg} - Payment ${payment.id} will retry on next automation cycle`);
            // Log the balance issue for tracking
            await this.paymentService.logPaymentEvent(payment.id, 'escrow_balance_insufficient', `${errorMsg}. Waiting for bridge transfer to complete.`, true);
            // Don't throw error - just return and let automation retry later
            return;
        }
        console.log(`[escrow] ✅ Bridge wallet has sufficient balance - proceeding with escrow creation`);
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
            payment.status = 'escrowed'; // Always escrowed for user visibility
            // Check if this is a high-value payment requiring multi-sig approval for RELEASE
            const thresholdUSD = parseFloat(process.env.MULTISIG_THRESHOLD_USD || '1000');
            const amountUSD = Number(payment.escrow.custody_amount) / 20; // Consistent with PreApprovalService: 1 USD = 20 MXN
            if (payment.escrow.custody_amount && amountUSD >= thresholdUSD) {
                console.log(`💰 High-value payment detected: ${payment.escrow.custody_amount} MXN (~$${amountUSD} USD) >= $${thresholdUSD} USD threshold`);
                // Flag for multi-sig approval during escrow release (admin-only visibility)
                payment.multisig_required = true;
                payment.multisig_status = 'pending'; // Set status for admin tracking
                // 🚀 CREATE PRE-APPROVAL IMMEDIATELY (Most Efficient Approach)
                try {
                    const preApproval = await MultiSigApprovalService_1.multiSigApprovalService.proposeTransaction({
                        paymentId: payment.id.toString(),
                        amount: payment.escrow.custody_amount,
                        amountUsd: amountUSD,
                        type: 'release',
                        createdBy: 'system',
                        description: `Pre-approval for escrow release - Payment ${payment.id}`,
                        metadata: {
                            escrowId: payment.escrow.id,
                            preApproval: true,
                            releaseDeadline: payment.escrow.custody_end
                        }
                    });
                    // Link pre-approval to payment
                    payment.multisig_approval_id = parseInt(preApproval.id);
                    console.log(`🔐 Pre-approval created for Payment ${payment.id} - Approval ID: ${preApproval.id}`);
                    console.log(`📧 Admins can now sign approval ${preApproval.id} before release deadline`);
                    // Log pre-approval creation
                    await this.paymentService.logPaymentEvent(payment.id, 'multisig_preapproval_created', `Pre-approval created for high-value payment. Approval ID: ${preApproval.id}. Signatures can be collected now.`, true);
                }
                catch (preApprovalError) {
                    console.error(`❌ Failed to create pre-approval for Payment ${payment.id}:`, preApprovalError.message);
                    // Continue without pre-approval - will create approval at release time
                }
                console.log(`🔐 Payment ${payment.id} flagged for multi-sig approval during escrow release`);
            }
            await escrowRepo.save(payment.escrow);
            await paymentRepo.save(payment);
            await this.paymentService.logPaymentEvent(payment.id, 'escrow_created', `Custodia ${createResult.escrowId} creada en blockchain. Tx: ${createResult.txHash}. ID de custodia: ${createResult.escrowId}`, true);
            // Send escrowed notification email
            try {
                const recipients = [];
                if (payment.payer_email) {
                    recipients.push({
                        email: payment.payer_email,
                        role: 'payer',
                        name: payment.user?.full_name || 'Pagador'
                    });
                }
                if (payment.recipient_email) {
                    recipients.push({
                        email: payment.recipient_email,
                        role: 'seller',
                        name: payment.seller?.full_name || 'Vendedor'
                    });
                }
                if (recipients.length > 0) {
                    await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                        eventType: 'escrow_created',
                        paymentId: payment.id.toString(),
                        paymentDetails: {
                            amount: payment.amount,
                            currency: payment.currency,
                            description: payment.description,
                            status: 'escrowed',
                            payer_email: payment.payer_email,
                            recipient_email: payment.recipient_email,
                            escrowId: createResult.escrowId,
                            txHash: createResult.txHash,
                            arbiscanUrl: `https://sepolia.arbiscan.io/tx/${createResult.txHash}`,
                            custodyAmount: payment.escrow.custody_amount,
                            custodyEnd: payment.escrow.custody_end
                        },
                        recipients
                    });
                    console.log(`📧 Payment ${payment.id} escrowed - email notifications sent`);
                }
            }
            catch (emailError) {
                console.error(`⚠️ Failed to send escrowed email notifications for payment ${payment.id}:`, emailError);
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
     * Process incomplete payments - handles missing seller redemptions and bridge withdrawals
     * This function is called by cron jobs to recover from failed automation
     */
    async processJunoWithdrawals() {
        try {
            console.log('🔍 Checking for incomplete payment processing...');
            if (!ormconfig_1.default.isInitialized) {
                await ormconfig_1.default.initialize();
            }
            // Find funded payments that might need processing
            const fundedPayments = await ormconfig_1.default.getRepository(Payment_1.Payment).find({
                where: {
                    status: 'funded'
                },
                relations: ['user', 'seller', 'escrow']
            });
            console.log(`📋 Found ${fundedPayments.length} funded payments to check`);
            for (const payment of fundedPayments) {
                try {
                    // Calculate amounts
                    const totalAmount = Math.round(Number(payment.amount) * 100); // Convert to cents
                    const custodyPercent = payment.escrow?.custody_percent || 0;
                    const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
                    const payoutAmount = totalAmount - custodyAmount;
                    // Check what needs to be processed
                    const needsSellerRedemption = !payment.juno_payment_id && payoutAmount > 0;
                    const needsBridgeWithdrawal = payment.escrow && payment.escrow.status === 'pending' && custodyAmount > 0;
                    if (!needsSellerRedemption && !needsBridgeWithdrawal) {
                        continue; // Payment is complete or doesn't need processing
                    }
                    console.log(`🔄 Processing incomplete Payment ${payment.id}:`);
                    console.log(`   - Needs seller redemption: ${needsSellerRedemption} ($${payoutAmount / 100})`);
                    console.log(`   - Needs bridge withdrawal: ${needsBridgeWithdrawal} ($${custodyAmount / 100})`);
                    // Step 1: Process seller redemption if missing
                    if (needsSellerRedemption) {
                        console.log(`💸 Processing seller redemption for Payment ${payment.id}: $${payoutAmount / 100}`);
                        await this.processSellerRedemption(payment, payoutAmount);
                        console.log(`✅ Seller redemption completed for Payment ${payment.id}`);
                    }
                    // Step 2: Process bridge withdrawal if missing
                    if (needsBridgeWithdrawal) {
                        console.log(`🌉 Processing bridge withdrawal for Payment ${payment.id}: $${custodyAmount / 100}`);
                        await this.processBridgeWithdrawal(payment, custodyAmount);
                        console.log(`✅ Bridge withdrawal completed for Payment ${payment.id}`);
                        // Wait for tokens to be available
                        console.log(`⏳ Waiting 60 seconds for MXNB tokens to be minted...`);
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        // Step 3: Create and fund escrow
                        console.log(`🔒 Creating escrow for Payment ${payment.id}`);
                        await this.processEscrowCreationAndFunding(payment, custodyAmount);
                        console.log(`✅ Escrow creation completed for Payment ${payment.id}`);
                    }
                    console.log(`🎉 Payment ${payment.id} processing completed successfully`);
                }
                catch (error) {
                    console.error(`❌ Error processing Payment ${payment.id}:`, error.message);
                    await this.paymentService.logPaymentEvent(payment.id, 'automation_error', `Recovery processing failed: ${error.message}`);
                }
            }
            console.log('✅ Incomplete payment processing completed');
        }
        catch (error) {
            console.error('❌ Error in processJunoWithdrawals:', error.message);
        }
    }
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
                    console.log(`🔓 Processing escrow ${escrow.id} for payment ${escrow.payment.id}`);
                    // Validate escrow is actually funded on-chain before attempting release
                    if (!escrow.smart_contract_escrow_id) {
                        console.error(`❌ Escrow ${escrow.id} has no smart contract ID, skipping`);
                        continue;
                    }
                    console.log(`🔍 Validating on-chain funding for escrow ID ${escrow.smart_contract_escrow_id}`);
                    // 🚀 NEW: Check if multi-sig approval is required
                    // Use custody_amount for escrow releases, not total payment amount
                    const route = await this.transactionRouter.routeTransaction({
                        amount: parseFloat(escrow.custody_amount.toString()),
                        type: 'escrow_release',
                        paymentId: escrow.payment.id
                    });
                    if (route.requiresApproval) {
                        console.log(`🔐 Multi-sig approval required for Payment ${escrow.payment.id} (escrow: $${escrow.custody_amount})`);
                        // 🆕 CHECK FOR PRE-APPROVED TRANSACTION
                        const preApprovedTx = await this.checkForPreApprovedTransaction(escrow.payment.id);
                        if (preApprovedTx && preApprovedTx.isFullySigned) {
                            console.log(`✅ Pre-approved transaction found for Payment ${escrow.payment.id}, executing...`);
                            await this.executePreApprovedTransaction(escrow, preApprovedTx);
                        }
                        else if (preApprovedTx) {
                            console.log(`⏳ Pre-approval exists but not fully signed for Payment ${escrow.payment.id} (${preApprovedTx.current_signatures}/${preApprovedTx.required_signatures})`);
                            // Payment remains 'escrowed' - multisig approval is tracked separately
                            // No status change needed as funds are still in escrow
                        }
                        else {
                            console.log(`🔐 Creating new multi-sig approval request for Payment ${escrow.payment.id}`);
                            await this.handleMultiSigRequired(escrow, route);
                        }
                    }
                    else {
                        console.log(`⚡ Direct release for Payment ${escrow.payment.id} (escrow: $${escrow.custody_amount})`);
                        const releaseTxHash = await this.releaseEscrowDirectly(escrow);
                        // Handle notifications for direct releases
                        await this.handleDirectReleaseNotifications(escrow, releaseTxHash);
                    }
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
                                recipients.push({
                                    email: payment.payer_email,
                                    role: 'payer',
                                    name: payment.user?.full_name || payment.payer_email?.split('@')[0] || 'Usuario'
                                });
                            }
                            if (payment.recipient_email) {
                                recipients.push({
                                    email: payment.recipient_email,
                                    role: 'seller',
                                    name: payment.seller?.full_name || 'Vendedor'
                                });
                            }
                            if (recipients.length > 0) {
                                await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                                    eventType: 'payout_completed',
                                    paymentId: payment.id.toString(),
                                    paymentDetails: {
                                        amount: payment.amount,
                                        currency: payment.currency || 'MXN',
                                        description: payment.description,
                                        payer_email: payment.payer_email,
                                        recipient_email: payment.recipient_email,
                                        status: 'completed',
                                        escrowId: payment.escrow?.smart_contract_escrow_id,
                                        reference: payment.reference
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
    /**
     * Check if a payment has a pre-approved multi-sig transaction
     */
    async checkForPreApprovedTransaction(paymentId) {
        try {
            // Get pending approvals for this payment
            const pendingApprovals = await MultiSigApprovalService_1.multiSigApprovalService.getPendingApprovals();
            const approval = pendingApprovals.find(a => a.paymentId === paymentId.toString());
            if (!approval) {
                return null;
            }
            // Get transaction details which include signatures
            const transactionDetails = await MultiSigApprovalService_1.multiSigApprovalService.getTransactionDetails(approval.id);
            const signatures = transactionDetails?.signatures || [];
            return {
                ...approval,
                current_signatures: signatures.length,
                required_signatures: approval.requiredSignatures,
                isFullySigned: signatures.length >= approval.requiredSignatures,
                signatures
            };
        }
        catch (error) {
            console.error(`Error checking pre-approved transaction for payment ${paymentId}:`, error.message);
            return null;
        }
    }
    /**
     * Execute a pre-approved multi-sig transaction
     */
    async executePreApprovedTransaction(escrow, approvalId) {
        try {
            const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            console.log(`🚀 Executing pre-approved multi-sig transaction ${approvalId} for Payment ${escrow.payment.id}`);
            // Execute the multi-sig transaction
            // Use the first multi-sig owner address as executor (has private key configured)
            const executorAddress = '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f'; // MULTISIG_OWNER_1
            const executionTxHash = await MultiSigApprovalService_1.multiSigApprovalService.executeTransaction(approvalId, executorAddress);
            // Update escrow status to released and store transaction hash
            escrow.status = 'released';
            escrow.release_tx_hash = executionTxHash;
            await escrowRepo.save(escrow);
            // Update payment status and multi-sig status
            escrow.payment.status = 'completed'; // Mark as completed since escrow is released
            escrow.payment.multisig_status = 'executed'; // Update multi-sig status
            await paymentRepo.save(escrow.payment);
            // Log the successful execution
            await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_released_multisig', `Pre-approved multi-sig transaction executed. Approval: ${approvalId}, Tx: ${executionTxHash}`, true);
            console.log(`✅ Pre-approved transaction ${approvalId} executed for Payment ${escrow.payment.id}. Tx: ${executionTxHash}`);
            // Send notifications
            await this.handleDirectReleaseNotifications(escrow, executionTxHash);
            // Process final payouts (seller commission, etc.)
            await this.processPendingPayouts();
        }
        catch (error) {
            console.error(`❌ Failed to execute pre-approved transaction ${approvalId} for payment ${escrow.payment.id}:`, error.message);
            // Log the execution error
            await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_error', `Pre-approved transaction ${approvalId} execution failed: ${error.message}`, true);
            throw error;
        }
    }
    /**
     * Handle escrow release that requires multi-sig approval
     */
    async handleMultiSigRequired(escrow, route) {
        try {
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            // 🚀 FIRST: Check if there's already a pre-approved transaction
            if (escrow.payment.multisig_approval_id) {
                console.log(`🔍 Checking pre-approval ${escrow.payment.multisig_approval_id} for Payment ${escrow.payment.id}`);
                const preApproval = await MultiSigApprovalService_1.multiSigApprovalService.getTransactionDetails(escrow.payment.multisig_approval_id.toString());
                if (preApproval && preApproval.status === 'approved') {
                    console.log(`✅ Pre-approval ${preApproval.id} is ready for execution!`);
                    // Execute the pre-approved transaction immediately
                    await this.executePreApprovedTransaction(escrow, preApproval.id);
                    return; // Exit early - transaction executed
                }
                else if (preApproval && preApproval.status === 'pending') {
                    console.log(`⏳ Pre-approval ${preApproval.id} still pending signatures (${preApproval.currentSignatures}/${preApproval.requiredSignatures})`);
                    // Log that we're waiting for signatures
                    await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_waiting', `Waiting for multi-sig signatures on pre-approval ${preApproval.id} (${preApproval.currentSignatures}/${preApproval.requiredSignatures} signed)`, true);
                    return; // Exit - waiting for more signatures
                }
            }
            // 📝 FALLBACK: Create new approval request if no pre-approval exists
            console.log(`📝 Creating new multi-sig approval for Payment ${escrow.payment.id}`);
            // Payment remains 'escrowed' - multisig approval is tracked separately
            // Funds are still in escrow, only the approval process is pending
            // Create multi-sig approval request
            const multiSigTx = await MultiSigApprovalService_1.multiSigApprovalService.proposeTransaction({
                paymentId: escrow.payment.id.toString(),
                amount: escrow.custody_amount || 0,
                amountUsd: Number(escrow.custody_amount || 0) / 20, // Consistent MXN/USD conversion: 1 USD = 20 MXN
                type: 'release',
                createdBy: 'system',
                description: `Escrow release for payment ${escrow.payment.id}`,
                metadata: { escrowId: escrow.id }
            });
            // Link the new approval to the payment
            escrow.payment.multisig_approval_id = parseInt(multiSigTx.id);
            await paymentRepo.save(escrow.payment);
            // Log multi-sig transaction creation
            await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_pending', `Multi-sig transaction created: ${multiSigTx.id}`, true);
            // Notify admins about the multi-sig requirement
            await this.notifyAdminsMultiSigRequired(escrow.payment);
            console.log(`🔐 Multi-sig transaction created for Payment ${escrow.payment.id}: ${multiSigTx.id}`);
        }
        catch (error) {
            console.error(`❌ Failed to handle multi-sig requirement for payment ${escrow.payment.id}:`, error.message);
            // Log the multi-sig setup error
            await this.paymentService.logPaymentEvent(escrow.payment.id, 'escrow_release_error', `Failed to create multi-sig transaction: ${error.message}`, true);
        }
    }
    /**
     * Release escrow directly (for transactions below multi-sig threshold)
     */
    async releaseEscrowDirectly(escrow) {
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        // Call smart contract release function
        console.log(`🔗 Calling smart contract release for escrow ID ${escrow.smart_contract_escrow_id}`);
        const releaseTxHash = await (0, escrowService_1.releaseEscrow)(Number(escrow.smart_contract_escrow_id));
        // Update escrow status to released and store transaction hash
        escrow.status = 'released';
        escrow.release_tx_hash = releaseTxHash;
        await escrowRepo.save(escrow);
        console.log(`✅ Escrow ${escrow.id} released directly. Tx: ${releaseTxHash}`);
        return releaseTxHash;
    }
    /**
     * Notify admins about pending multi-sig approval
     */
    async notifyAdminsMultiSigRequired(payment) {
        try {
            // Create in-app notifications for multi-sig requirement
            await (0, paymentNotificationIntegration_1.createPaymentNotifications)(payment.id, 'escrow_executing');
            console.log(`📧 Multi-sig approval notification sent for Payment ${payment.id}`);
            // Send email notification to admins
            const adminEmails = [
                { email: 'rodrigojille6@gmail.com', role: 'admin' }
            ];
            await (0, paymentNotificationService_1.sendPaymentEventNotification)({
                eventType: 'escrow_executing',
                paymentId: payment.id.toString(),
                paymentDetails: {
                    amount: payment.amount,
                    description: payment.description,
                    payer_email: payment.payer_email,
                    recipient_email: payment.recipient_email
                },
                recipients: adminEmails
            });
        }
        catch (error) {
            console.error(`⚠️ Failed to send multi-sig approval notifications for payment ${payment.id}:`, error);
        }
    }
    /**
     * Execute approved multi-sig escrow release
     * This method will be called when multi-sig approval is complete
     */
    async executeApprovedMultiSigRelease(paymentId) {
        try {
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
            // Find the payment and its escrow
            const payment = await paymentRepo.findOne({
                where: { id: paymentId },
                relations: ['escrow']
            });
            if (!payment || !payment.escrow) {
                throw new Error(`Payment ${paymentId} or its escrow not found`);
            }
            const escrow = payment.escrow;
            // Get pending approvals for this payment
            const pendingApprovals = await MultiSigApprovalService_1.multiSigApprovalService.getPendingApprovals();
            const approval = pendingApprovals.find(a => a.paymentId === paymentId.toString());
            if (!approval) {
                throw new Error(`No multi-sig approval found for payment ${paymentId}`);
            }
            // Execute the escrow release via multi-sig
            console.log(`🔐 Executing multi-sig approved escrow release for Payment ${paymentId}`);
            // Use the first multi-sig owner address as executor (has private key configured)
            const executorAddress = '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f'; // MULTISIG_OWNER_1
            const releaseTxHash = await MultiSigApprovalService_1.multiSigApprovalService.executeTransaction(approval.id, executorAddress);
            // Update escrow and payment status
            escrow.status = 'released';
            escrow.release_tx_hash = releaseTxHash;
            payment.status = 'completed';
            payment.multisig_status = 'approved'; // Admin tracking only
            await escrowRepo.save(escrow);
            await paymentRepo.save(payment);
            // Log the successful execution
            await this.paymentService.logPaymentEvent(paymentId, 'escrow_release_success', `Multi-sig approved escrow release executed. Tx: ${releaseTxHash}`, true);
            console.log(`✅ Multi-sig escrow release executed for Payment ${paymentId}. Tx: ${releaseTxHash}`);
        }
        catch (error) {
            console.error(`❌ Failed to execute multi-sig escrow release for payment ${paymentId}:`, error.message);
            // Log the execution error
            await this.paymentService.logPaymentEvent(paymentId, 'escrow_release_error', `Failed to execute multi-sig escrow release: ${error.message}`, true);
        }
    }
    /**
     * Handle notifications for direct escrow releases
     */
    async handleDirectReleaseNotifications(escrow, releaseTxHash) {
        try {
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
            console.error(`❌ Failed to handle direct release notifications for escrow ${escrow.id}:`, error.message);
        }
    }
    /**
     * Retry failed escrow creations for funded payments
     * This handles cases where MXNB balance was insufficient during initial automation
     */
    async retryFailedEscrowCreations() {
        try {
            if (!ormconfig_1.default.isInitialized) {
                console.warn('⚠️ Database not initialized, skipping escrow retry');
                return;
            }
            const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
            const eventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
            // Find funded payments that don't have escrow created yet
            // and have been funded for more than 2 minutes
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            const fundedPayments = await paymentRepo.find({
                where: {
                    status: 'funded'
                },
                relations: ['escrow', 'user', 'seller']
            });
            const paymentsNeedingEscrow = fundedPayments.filter(payment => {
                // Check if payment has escrow configuration but no smart contract created
                const hasEscrowConfig = payment.escrow && payment.escrow.custody_percent > 0;
                const noSmartContract = !payment.escrow?.smart_contract_escrow_id;
                const fundedLongEnough = payment.updated_at && payment.updated_at < twoMinutesAgo;
                return hasEscrowConfig && noSmartContract && fundedLongEnough;
            });
            if (paymentsNeedingEscrow.length === 0) {
                return; // No payments need escrow retry
            }
            console.log(`🔄 Found ${paymentsNeedingEscrow.length} payments needing escrow retry`);
            for (const payment of paymentsNeedingEscrow) {
                try {
                    console.log(`🔄 Retrying escrow creation for payment ${payment.id}`);
                    // Check for recent automation errors
                    const recentErrors = await eventRepo.find({
                        where: {
                            paymentId: payment.id,
                            type: 'automation_error'
                        },
                        order: { created_at: 'DESC' },
                        take: 1
                    });
                    const hasRecentError = recentErrors.length > 0 &&
                        recentErrors[0].description?.includes('transfer amount exceeds balance');
                    if (hasRecentError) {
                        console.log(`🔄 Payment ${payment.id} had balance error, retrying escrow creation...`);
                        const totalAmount = Number(payment.amount);
                        const custodyPercent = payment.escrow?.custody_percent || 0;
                        const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
                        if (custodyAmount > 0) {
                            // Wait a bit for MXNB tokens to be available
                            console.log(`⏳ Waiting 30 seconds before retry for payment ${payment.id}...`);
                            await new Promise(resolve => setTimeout(resolve, 30000));
                            await this.processEscrowCreationAndFunding(payment, custodyAmount);
                            await this.paymentService.logPaymentEvent(payment.id, 'escrow_retry_success', `Escrow creation retry successful after balance error`, true);
                        }
                    }
                }
                catch (error) {
                    console.error(`❌ Escrow retry failed for payment ${payment.id}:`, error.message);
                    await this.paymentService.logPaymentEvent(payment.id, 'escrow_retry_error', `Escrow retry failed: ${error.message}`, false);
                }
            }
        }
        catch (error) {
            console.error('❌ Error in retryFailedEscrowCreations:', error.message);
        }
    }
}
exports.PaymentAutomationService = PaymentAutomationService;
