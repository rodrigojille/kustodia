import { PaymentService } from './paymentService';
import { releaseEscrow, createEscrow, checkAndUnpauseIfNeeded } from './escrowService';
import { listJunoTransactions, redeemMXNBToMXN, withdrawMXNBToBridge, getRegisteredBankAccounts, initializeJunoService, verifyWithdrawalProcessed, listRecentWithdrawals, registerBankAccount } from './junoService';
import { createPaymentNotifications } from './paymentNotificationIntegration';
import { sendPaymentEventNotification } from '../utils/paymentNotificationService';
import { TransactionRouterService } from './TransactionRouterService';
import { multiSigApprovalService } from './MultiSigApprovalService';
import { LessThan, MoreThan, Not, IsNull, In } from 'typeorm';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { createHmac } from 'node:crypto';
import axios from 'axios';
import { ethers } from 'ethers';
import { Pool } from 'pg';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

dotenv.config();

interface SpeiDeposit {
  fid: string;
  deposit_id: string;
  receiver_clabe: string;
  status: string;
  amount: string;
  created_at: string;
}

export class PaymentAutomationService {
  private paymentService: PaymentService;
  private transactionRouter: TransactionRouterService;

  constructor() {
    this.paymentService = new PaymentService();
    this.transactionRouter = new TransactionRouterService();
    // Initialize Juno service to set up API credentials
    initializeJunoService();
  }

  /**
   * Initialize all automation processes
   */
  async startAutomation(): Promise<void> {
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

    // Every 1 minute: Retry failed escrow creations for funded payments (increased frequency)
    cron.schedule('* * * * *', async () => {
      await this.retryFailedEscrowCreations();
    });

    // Every 30 seconds: Quick escrow retry for recent failures (aggressive recovery)
    cron.schedule('*/30 * * * * *', async () => {
      await this.quickEscrowRetry();
    });

    console.log('✅ Automatización iniciada exitosamente');
    console.log('📊 Automation Schedule:');
    console.log('   • New deposits: Every 1 minute');
    console.log('   • Escrow retries: Every 1 minute');
    console.log('   • Quick retries: Every 30 seconds');
    console.log('   • Payouts: Every 2 minutes');
    console.log('   • Custody releases: Every 10 minutes');
  }

  /**
   * AUTOMATION 1: Detect new deposits and trigger payment processing
   */
  async processNewDeposits(): Promise<void> {
    try {
      // console.log('🔍 Revisando nuevos depósitos SPEI...');
      
      if (!AppDataSource.isInitialized) {
        console.warn('⚠️ Database not initialized, skipping deposit processing');
        return;
      }

      const paymentRepo = AppDataSource.getRepository(Payment);
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

      const junoTransactions: SpeiDeposit[] = await listJunoTransactions();
      let processedCount = 0;

      for (const payment of pendingPayments) {
        const matchingDeposit = junoTransactions.find((tx: SpeiDeposit) => {
          const depositAmount = Number(tx.amount);
          const paymentAmount = Number(payment.amount);
          const statusMatch = tx.status === 'complete';
          const amountMatch = depositAmount === paymentAmount;
          const clabeMatch = tx.receiver_clabe === payment.deposit_clabe;
          return statusMatch && amountMatch && clabeMatch;
        });

        if (matchingDeposit && !payment.reference) {
          try {
            await AppDataSource.transaction(async (manager) => {
              const paymentRepo = manager.getRepository(Payment);
              const eventRepo = manager.getRepository(PaymentEvent);

              const paymentToUpdate = await paymentRepo.findOne({
                where: { id: payment.id, status: 'pending' },
                lock: { mode: 'pessimistic_write' }
              });

              if (paymentToUpdate) {
                paymentToUpdate.status = 'funded';
                paymentToUpdate.reference = matchingDeposit.fid;
                paymentToUpdate.transaction_id = matchingDeposit.deposit_id;
                await paymentRepo.save(paymentToUpdate);

                const event = new PaymentEvent();
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
                    await sendPaymentEventNotification({
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
                } catch (emailError) {
                  console.error(`⚠️ Failed to send funded email notifications for payment ${paymentToUpdate.id}:`, emailError);
                }
              } else {
                console.log(`⏩ Payment ${payment.id} was already processed. Skipping.`);
                return;
              }
            });

            // Create payment funded notification
            try {
              await createPaymentNotifications(payment.id, 'funds_received');
              console.log(`📧 Payment ${payment.id} funded - notifications sent`);
            } catch (notificationError) {
              console.error(`⚠️ Failed to send notifications for payment ${payment.id}:`, notificationError);
            }

            processedCount++;
            await this.processPaymentAutomation(payment.id);

          } catch (transactionError) {
            console.error(`❌ Error processing payment ${payment.id}:`, transactionError);
          }
        }
      }

      if (processedCount > 0) {
        console.log(`🎉 ${processedCount} new deposits processed into payments.`);
      }
    } catch (error: any) {
      console.error('❌ Error in processNewDeposits:', error.message);
    }
  }

  /**
   * Complete payment automation flow after funding
   */
  async processPaymentAutomation(paymentId: number): Promise<void> {
    try {
      console.log(`🚀 Starting automation for payment ${paymentId}`);
      
      // Debug: Check network configuration first
      const networkConfig = getCurrentNetworkConfig();
      console.log(`🔧 Network config - Network: ${networkConfig.networkName}`);
      console.log(`🔧 Network config - Bridge wallet: ${networkConfig.bridgeWallet || 'NOT SET'}`);
      console.log(`🔧 Network config - Juno env: ${networkConfig.junoEnv}`);
      console.log(`🔧 Network config - Juno API key: ${networkConfig.junoApiKey ? networkConfig.junoApiKey.slice(0, 8) + '...' : 'NOT SET'}`);
      
      if (!networkConfig.bridgeWallet) {
        const errorMsg = `❌ CRITICAL: Bridge wallet not configured for ${networkConfig.networkName}. Required env var: ${networkConfig.networkName.includes('Mainnet') ? 'BRIDGE_WALLET_MAIN' : 'ESCROW_BRIDGE_WALLET'}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const paymentRepo = AppDataSource.getRepository(Payment);
      const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ['escrow', 'user', 'seller'] });

      if (!payment) {
        const errorMsg = `Payment ${paymentId} not found`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }
      if (payment.status !== 'funded') {
        const errorMsg = `Payment ${paymentId} not in 'funded' status (current: ${payment.status})`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
      }

      console.log(`✅ Payment ${paymentId} validation passed - proceeding with automation`);

      // Wait 3 minutes after deposit detection for Juno to mint MXNB tokens
      console.log(`⏳ Waiting 3 minutes for Juno to process deposit and mint MXNB tokens...`);
      await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minute delay
      console.log(`✅ Wait complete - proceeding with automation`);

      const totalAmount = Number(payment.amount);
      const custodyPercent = payment.escrow?.custody_percent || 0;
      const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
      const payoutAmount = totalAmount - custodyAmount;
      
      console.log(`💰 Payment amounts - Total: ${totalAmount}, Custody: ${custodyAmount}, Payout: ${payoutAmount}`);

      let payoutSucceeded = false;

      // Try to process seller redemption (payout)
      if (payoutAmount > 0) {
        try {
          await this.processSellerRedemption(payment, payoutAmount);
          payoutSucceeded = true;
          console.log(`✅ Seller payout of ${payoutAmount} MXN completed successfully`);
        } catch (payoutError: any) {
          console.error(`❌ Seller payout failed: ${payoutError.message}`);
          console.log(`⚠️ Payout failed - ${payoutAmount} MXN remains in Juno for manual processing`);
          console.log(`📋 Escrow will still be created with original custody amount: ${custodyAmount} MXN`);
          
          await this.paymentService.logPaymentEvent(
            paymentId, 
            'payout_failed', 
            `Seller payout failed: ${payoutError.message}. ${payoutAmount} MXN remains in Juno. Escrow will contain ${custodyAmount} MXN as planned.`,
            true
          );
        }
      }

      // Always try to create escrow with original custody amount
      if (custodyAmount > 0) {
        try {
          // Verify bridge wallet has sufficient MXNB balance before proceeding
          console.log(`🔍 Verifying bridge wallet balance before escrow creation...`);
          const balanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
          
          if (!balanceCheck.hasBalance) {
            throw new Error(`Insufficient MXNB balance in bridge wallet. Required: ${balanceCheck.requiredBalance}, Available: ${balanceCheck.currentBalance}`);
          }
          
          console.log(`✅ Bridge wallet balance verified: ${balanceCheck.currentBalance} MXNB available`);
          
          await this.processBridgeWithdrawal(payment, custodyAmount);
          await this.processEscrowCreationAndFunding(payment, custodyAmount);
          console.log(`✅ Escrow created with ${custodyAmount} MXN`);
        } catch (escrowError: any) {
          console.error(`❌ Escrow creation failed: ${escrowError.message}`);
          throw escrowError; // Re-throw to trigger retry mechanism
        }
      }

    } catch (error: any) {
      console.error(`❌ Automation failed for payment ${paymentId}:`, error.message);
      await this.paymentService.logPaymentEvent(paymentId, 'automation_error', `Automation failed: ${error.message}`);
    }
  }

  /**
   * Get escrow status from smart contract
   */
  private async getEscrowContractStatus(escrowId: number): Promise<string | null> {
    try {
      // This would query the smart contract to get the actual on-chain status
      // For now, we'll implement a basic version that can be enhanced
      console.log(`🔍 Checking contract status for escrow ${escrowId}`);
      
      // TODO: Implement actual smart contract status query
      // This should call the escrow contract to get the actual status
      // For now, return null to indicate no status change needed
      return null;
    } catch (error: any) {
      console.error(`❌ Error getting contract status for escrow ${escrowId}:`, error.message);
      return null;
    }
  }

  /**
   * Process SPEI redemption to seller
   * Auto-registers bank account with Juno if missing
   * First transfers MXNB from bridge wallet to Juno, then redeems to MXN
   */
  private async processSellerRedemption(payment: Payment, amount: number): Promise<void> {
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
          const registrationResult = await registerBankAccount(
            payment.seller.payout_clabe,
            payment.seller.full_name || payment.seller.email
          );
          
          console.log(`✅ Bank account registered with Juno:`, registrationResult);
          
          // Update the user's juno_bank_account_id in the database
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.update(
          { id: payment.seller.id },
          { juno_bank_account_id: registrationResult.id }
        );
        
        // Update the payment.seller object for immediate use
        payment.seller.juno_bank_account_id = registrationResult.id;
        
        await this.paymentService.logPaymentEvent(
          payment.id,
          'bank_account_registered',
          `Auto-registered bank account for ${payment.seller.email}: CLABE ${payment.seller.payout_clabe} -> Juno ID ${registrationResult.id}`,
          false
        );
        
        console.log(`✅ Updated seller ${payment.seller.email} with juno_bank_account_id: ${registrationResult.id}`);
        
        // Add delay to allow registration to propagate in Juno system
        console.log('⏳ Waiting 5 seconds for bank account registration to propagate...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Validate registration by attempting to fetch the account
        try {
          console.log(`🔍 Validating bank account registration for ${registrationResult.id}...`);
          // The redemption process will validate the account exists
        } catch (validationError: any) {
          console.warn(`⚠️ Could not validate bank account registration immediately: ${validationError.message}`);
          // Continue anyway - the redemption process will handle validation
        }
          
        } catch (registrationError: any) {
          console.error(`❌ Failed to register bank account for ${payment.seller.email}:`, registrationError.message);
          
          // Log detailed error for debugging
          await this.paymentService.logPaymentEvent(
            payment.id,
            'bank_account_registration_failed',
            `Failed to register bank account for ${payment.seller.email}: ${registrationError.message}`,
            true
          );
          
          // Check if it's a duplicate registration error (account already exists)
          if (registrationError.message.includes('already exists') || registrationError.message.includes('duplicate')) {
            console.log(`⚠️ Bank account may already be registered. Attempting to continue with payout...`);
            // Continue with the process - the redemption will validate if account exists
          } else {
            throw new Error(`Bank account registration failed: ${registrationError.message}`);
          }
        }
      }
      
      // STEP 1: Check if bridge-to-juno transfer already completed (idempotency)
      console.log(`🔍 Checking if bridge-to-juno transfer already completed for payment ${payment.id}...`);
      
      const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);
      const existingTransfer = await paymentEventRepo.findOne({
        where: {
          paymentId: payment.id,
          type: 'bridge_to_juno_transfer'
        }
      });
      
      if (existingTransfer) {
        console.log(`✅ Bridge-to-juno transfer already completed for payment ${payment.id}. Skipping duplicate transfer.`);
        console.log(`📋 Existing transfer event:`, existingTransfer);
      } else {
        // STEP 1: Transfer MXNB from bridge wallet to Juno wallet
        console.log(`🌉 Step 1: Transferring ${amount} MXNB from bridge wallet to Juno...`);
        try {
          const transferTxHash = await this.transferBridgeToJuno(amount);
        
          await this.paymentService.logPaymentEvent(
            payment.id,
            'bridge_to_juno_transfer',
            `Transferred ${amount} MXNB from bridge wallet to Juno. Tx: ${transferTxHash}`,
            false
          );
          
          console.log(`✅ Bridge to Juno transfer completed for payment ${payment.id}`);
          
        } catch (transferError: any) {
          console.error(`❌ Bridge to Juno transfer failed for payment ${payment.id}:`, transferError.message);
          throw new Error(`Bridge to Juno transfer failed: ${transferError.message}`);
        }
      }
      
      // STEP 2: Get registered bank accounts and find the seller's account (with retry logic)
      console.log(`🔍 Looking for bank account ID: ${payment.seller.juno_bank_account_id}`);
      
      let destinationBankAccount = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!destinationBankAccount && retryCount < maxRetries) {
        if (retryCount > 0) {
          console.log(`⏳ Waiting 3 seconds for Juno API synchronization (attempt ${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }
        
        const bankAccounts = await getRegisteredBankAccounts();
        console.log(`📋 Found ${bankAccounts.length} registered bank accounts`);
        
        destinationBankAccount = bankAccounts.find(account => account.id === payment.seller!.juno_bank_account_id);
        retryCount++;
      }
      
      if (!destinationBankAccount) {
        throw new Error(`Seller's bank account ${payment.seller.juno_bank_account_id} not found in registered accounts after ${maxRetries} attempts`);
      }
      
      // STEP 3: Process the MXNB redemption to MXN via SPEI
      console.log(`🏦 Step 2: Redeeming ${amount} MXNB to MXN via SPEI...`);
      const redemptionResult = await redeemMXNBToMXN(amount, destinationBankAccount.id);
      
      await this.paymentService.logPaymentEvent(
        payment.id,
        'spei_redemption_initiated',
        `SPEI redemption of ${amount} MXNB -> MXN to ${destinationBankAccount.clabe}. Tx ID: ${redemptionResult.id}`,
        false
      );
      
      // Send payout completed notification
      try {
        await createPaymentNotifications(payment.id, 'payout_completed');
        console.log(`📧 Payment ${payment.id} payout completed - notifications sent`);
      } catch (notificationError) {
        console.error(`⚠️ Failed to send payout completed notifications for payment ${payment.id}:`, notificationError);
      }
      
      console.log(`✅ SPEI redemption initiated for payment ${payment.id}`);
      
    } catch (error: any) {
      console.error(`❌ Seller redemption failed for payment ${payment.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Process MXNB withdrawal to bridge wallet with enhanced error handling
   */
  private async processBridgeWithdrawal(payment: Payment, amount: number): Promise<void> {
    const bridgeWallet = getCurrentNetworkConfig().bridgeWallet;
    if (!bridgeWallet) throw new Error('ESCROW_BRIDGE_WALLET not set in .env');

    try {
      console.log(`🔄 Starting bridge withdrawal for payment ${payment.id}: ${amount} MXNB to ${bridgeWallet}`);
      
      const withdrawalResult = await withdrawMXNBToBridge(amount, bridgeWallet);
      
      await this.paymentService.logPaymentEvent(
        payment.id,
        'bridge_withdrawal_success',
        `Retiro de ${amount} MXNB a billetera puente completado exitosamente. ID de retiro: ${withdrawalResult?.id || 'N/A'}`,
        true
      );
      
      console.log(`✅ Bridge withdrawal for payment ${payment.id} completed successfully`);
      console.log(`📋 Withdrawal details:`, withdrawalResult);
      
    } catch (error: any) {
      console.error(`❌ Bridge withdrawal failed for payment ${payment.id}:`, error.message);
      
      // Log the error but check if withdrawal might have succeeded anyway
      await this.paymentService.logPaymentEvent(
        payment.id,
        'bridge_withdrawal_error',
        `Withdrawal error: ${error.message}. Verifying if withdrawal was processed...`,
        false
      );
      
      // Give some time for potential processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify if withdrawal was actually processed despite the error
      console.log(`🔍 Verifying if withdrawal was actually processed for payment ${payment.id}...`);
      const verifiedWithdrawal = await verifyWithdrawalProcessed(amount, bridgeWallet, 10);
      
      if (verifiedWithdrawal) {
        console.log(`✅ Withdrawal verification successful for payment ${payment.id} - withdrawal was processed despite error`);
        
        await this.paymentService.logPaymentEvent(
          payment.id,
          'bridge_withdrawal_verified',
          `Withdrawal verified as successful despite initial error. Withdrawal ID: ${verifiedWithdrawal.id || 'N/A'}`,
          true
        );
        
        // Don't throw error since withdrawal was successful
        return;
      } else {
        console.log(`❌ Withdrawal verification failed for payment ${payment.id} - withdrawal was not processed`);
        
        await this.paymentService.logPaymentEvent(
          payment.id,
          'bridge_withdrawal_failed',
          `Withdrawal failed and could not be verified: ${error.message}`,
          false
        );
        
        throw error;
      }
    }
  }

  /**
   * Check MXNB balance in bridge wallet
   */
  private async checkBridgeWalletBalance(requiredAmount: number): Promise<{ hasBalance: boolean; currentBalance: string; requiredBalance: string }> {
    try {
      const networkConfig = getCurrentNetworkConfig();
      const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      const tokenAddress = networkConfig.mxnbTokenAddress;
      const bridgeWallet = getCurrentNetworkConfig().bridgeWallet;
      
      const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([
        token.balanceOf(bridgeWallet),
        token.decimals()
      ]);
      
      const currentBalance = ethers.formatUnits(balance, decimals);
      const requiredBalance = requiredAmount.toString();
      const hasBalance = parseFloat(currentBalance) >= requiredAmount;
      
      console.log(`[balance] Bridge wallet MXNB balance check:`);
      console.log(`   Wallet: ${bridgeWallet}`);
      console.log(`   Current: ${currentBalance} MXNB`);
      console.log(`   Required: ${requiredBalance} MXNB`);
      console.log(`   Sufficient: ${hasBalance}`);
      
      return { hasBalance, currentBalance, requiredBalance };
    } catch (error: any) {
      console.error(`[balance] Error checking bridge wallet balance:`, error.message);
      return { hasBalance: false, currentBalance: '0', requiredBalance: requiredAmount.toString() };
    }
  }

  /**
   * Create and fund the escrow contract after bridge withdrawal
   * Flow 1: Both payer and payee are bridge wallet (platform-managed custody)
   */
  private async processEscrowCreationAndFunding(payment: Payment, custodyAmount: number): Promise<void> {
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const tokenAddress = getCurrentNetworkConfig().mxnbTokenAddress;
    const bridgeWallet = getCurrentNetworkConfig().bridgeWallet;

    if (!payment.escrow) throw new Error(`Payment ${payment.id} missing escrow relation`);
    if (!payment.escrow.custody_end) throw new Error(`Payment ${payment.id} escrow missing custody_end date`);
    
    // ✅ BALANCE VERIFICATION - Check if bridge wallet has sufficient MXNB tokens
    const balanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
    if (!balanceCheck.hasBalance) {
      const errorMsg = `Insufficient MXNB balance in bridge wallet. Required: ${balanceCheck.requiredBalance} MXNB, Available: ${balanceCheck.currentBalance} MXNB`;
      console.log(`[escrow] ⏳ ${errorMsg} - Payment ${payment.id} will retry on next automation cycle`);
      
      // Log the balance issue for tracking
      await this.paymentService.logPaymentEvent(
        payment.id,
        'escrow_balance_insufficient',
        `${errorMsg}. Waiting for bridge transfer to complete.`,
        true
      );
      
      // Don't throw error - just return and let automation retry later
      return;
    }
    
    console.log(`[escrow] ✅ Bridge wallet has sufficient balance - proceeding with escrow creation`);
    
    // Calculate deadline with proper timezone handling
    // The issue: custody_end from DB is in local timezone but getTime() treats it as UTC
    let deadline: number;
    
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
    } else {
      // Use the original deadline
      deadline = custodyEndTimestamp;
      console.log(`[escrow] Using original deadline: ${new Date(deadline * 1000).toISOString()}`);
    }

    try {
      // Flow 1: Both payer and payee are bridge wallet (platform manages custody)
      const createResult = await createEscrow({
        payer: bridgeWallet,
        payee: bridgeWallet, // Flow 1: Bridge wallet manages custody for both parties
        token: tokenAddress,
        amount: custodyAmount.toString(),
        deadline: deadline,
        vertical: payment.vertical_type || '',
        clabe: payment.deposit_clabe || '',
        conditions: 'flow1-platform-managed-custody'
      });

      if (!createResult?.escrowId) throw new Error('Escrow creation failed to return a valid ID.');

      // Fund the escrow (pausable contract requires separate funding step)
      console.log(`💰 Funding escrow ${createResult.escrowId} with ${custodyAmount} tokens...`);
      const { fundEscrow } = await import('./escrowService');
      const fundTxHash = await fundEscrow(createResult.escrowId, tokenAddress, custodyAmount.toString());
      console.log(`✅ Escrow funded successfully: ${fundTxHash}`);

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
          const preApproval = await multiSigApprovalService.proposeTransaction({
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
          await this.paymentService.logPaymentEvent(
            payment.id,
            'multisig_preapproval_created',
            `Pre-approval created for high-value payment. Approval ID: ${preApproval.id}. Signatures can be collected now.`,
            true
          );
          
        } catch (preApprovalError: any) {
          console.error(`❌ Failed to create pre-approval for Payment ${payment.id}:`, preApprovalError.message);
          // Continue without pre-approval - will create approval at release time
        }
        
        console.log(`🔐 Payment ${payment.id} flagged for multi-sig approval during escrow release`);
      }

      await escrowRepo.save(payment.escrow);
      await paymentRepo.save(payment);

      await this.paymentService.logPaymentEvent(
        payment.id,
        'escrow_created',
        `Custodia ${createResult.escrowId} creada en blockchain. Tx: ${createResult.txHash}. ID de custodia: ${createResult.escrowId}`,
        true
      );
      
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
          await sendPaymentEventNotification({
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
              arbiscanUrl: `${getCurrentNetworkConfig().explorerUrl}/tx/${createResult.txHash}`,
              custodyAmount: payment.escrow.custody_amount,
              custodyEnd: payment.escrow.custody_end
            },
            recipients
          });
          console.log(`📧 Payment ${payment.id} escrowed - email notifications sent`);
        }
      } catch (emailError) {
        console.error(`⚠️ Failed to send escrowed email notifications for payment ${payment.id}:`, emailError);
      }
      
      console.log(`✅ Escrow ${createResult.escrowId} created and payment ${payment.id} updated to 'escrowed'`);

    } catch (error: any) {
      console.error(`❌ Escrow creation failed for payment ${payment.id}:`, error.message);
      await this.paymentService.logPaymentEvent(payment.id, 'escrow_error', `Error al crear custodia: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * Process incomplete payments - handles missing seller redemptions and bridge withdrawals
   * This function is called by cron jobs to recover from failed automation
   */
  async processJunoWithdrawals(): Promise<void> {
    try {
      console.log('🔍 Checking for incomplete payment processing...');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Find funded payments that might need processing
      const fundedPayments = await AppDataSource.getRepository(Payment).find({
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
          console.log(`   - Needs seller redemption: ${needsSellerRedemption} ($${payoutAmount/100})`);
          console.log(`   - Needs bridge withdrawal: ${needsBridgeWithdrawal} ($${custodyAmount/100})`);

          // Step 1: Process seller redemption if missing
          if (needsSellerRedemption) {
            console.log(`💸 Processing seller redemption for Payment ${payment.id}: $${payoutAmount/100}`);
            await this.processSellerRedemption(payment, payoutAmount);
            console.log(`✅ Seller redemption completed for Payment ${payment.id}`);
          }

          // Step 2: Process bridge withdrawal if missing
          if (needsBridgeWithdrawal) {
            console.log(`🌉 Processing bridge withdrawal for Payment ${payment.id}: $${custodyAmount/100}`);
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

        } catch (error: any) {
          console.error(`❌ Error processing Payment ${payment.id}:`, error.message);
          await this.paymentService.logPaymentEvent(payment.id, 'automation_error', `Recovery processing failed: ${error.message}`);
        }
      }

      console.log('✅ Incomplete payment processing completed');

    } catch (error: any) {
      console.error('❌ Error in processJunoWithdrawals:', error.message);
    }
  }

  /**
   * Release expired custodies
   */
  async releaseExpiredCustodies(): Promise<void> {
    try {
      console.log('🔍 Checking for expired custodies to release...');
      
      if (!AppDataSource.isInitialized) {
        console.warn('⚠️ Database not initialized, skipping custody release');
        return;
      }

      const escrowRepo = AppDataSource.getRepository(Escrow);
      const now = new Date();
      
      // Find escrows ready for release:
      // 1. Traditional payments: funded/active and past deadline
      // 2. Nuevo flujo with dual approval: immediate release (ignore deadline)
      // 3. Nuevo flujo without dual approval: BLOCK release even after deadline
      // IMPORTANT: Only process escrows that haven't been released yet
      const expiredEscrows = await escrowRepo.find({
        where: [
          {
            status: In(['funded', 'active']), // Not 'released'
            release_tx_hash: IsNull(), // No existing release transaction
            custody_end: LessThan(now),
            payment: {
              payment_type: Not('nuevo_flujo') // Traditional payments only
            }
          },
          {
            status: In(['funded', 'active']), // Not 'released'
            release_tx_hash: IsNull(), // No existing release transaction
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
          } else {
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
            } else if (preApprovedTx) {
              console.log(`⏳ Pre-approval exists but not fully signed for Payment ${escrow.payment.id} (${preApprovedTx.current_signatures}/${preApprovedTx.required_signatures})`);
              // Payment remains 'escrowed' - multisig approval is tracked separately
              // No status change needed as funds are still in escrow
            } else {
              console.log(`🔐 Creating new multi-sig approval request for Payment ${escrow.payment.id}`);
              await this.handleMultiSigRequired(escrow, route);
            }
          } else {
            console.log(`⚡ Direct release for Payment ${escrow.payment.id} (escrow: $${escrow.custody_amount})`);
            const releaseTxHash = await this.releaseEscrowDirectly(escrow);
            
            // Handle notifications for direct releases
            await this.handleDirectReleaseNotifications(escrow, releaseTxHash);
          }
          
        } catch (error: any) {
          console.error(`❌ Failed to release escrow ${escrow.id}:`, error.message);
          
          // Only try to log payment event if payment exists
          if (escrow.payment) {
            await this.paymentService.logPaymentEvent(
              escrow.payment.id,
              'escrow_release_error',
              `Failed to release escrow ${escrow.id}: ${error.message}`,
              true
            );
          }
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in releaseExpiredCustodies:', error.message);
    }
  }

  /**
   * Process payouts for released escrows
   */
  async processPendingPayouts(): Promise<void> {
    try {
      console.log('💸 Processing pending payouts...');
      
      if (!AppDataSource.isInitialized) {
        console.warn('⚠️ Database not initialized, skipping payout processing');
        return;
      }

      const escrowRepo = AppDataSource.getRepository(Escrow);
      const paymentRepo = AppDataSource.getRepository(Payment);
      
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
            await this.paymentService.logPaymentEvent(
              payment.id,
              'payout_completed',
              `Pago completado exitosamente. SPEI enviado al beneficiario.`,
              true
            );
            
            // Create payment completion notification
            try {
              await createPaymentNotifications(payment.id, 'payout_completed');
              console.log(`📧 Payment ${payment.id} completed - in-app notifications sent`);
            } catch (notificationError) {
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
                await sendPaymentEventNotification({
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
            } catch (emailError) {
              console.error(`⚠️ Failed to send payment completion email notifications for payment ${payment.id}:`, emailError);
            }
            
            console.log(`✅ Payout completed for payment ${payment.id}`);
            
          } catch (redemptionError: any) {
          // Reset status back to funded for retry
          payment.status = 'funded';
          await paymentRepo.save(payment);
          
          // Properly format error message
          const errorMessage = redemptionError.message || JSON.stringify(redemptionError) || 'Unknown error';
          
          // Log the error
          await this.paymentService.logPaymentEvent(
            payment.id,
            'payout_error',
            `Pago fallido: ${errorMessage}`,
            true
          );
          
          console.error(`❌ Payout failed for payment ${payment.id}:`, errorMessage);
          console.error('Full error object:', redemptionError);
        }
        
      } catch (error: any) {
          console.error(`❌ Failed to process payout for escrow ${escrow.id}:`, error.message);
          
          // Reset payment status for retry if it was set to processing
          if (escrow.payment.status === 'processing') {
            escrow.payment.status = 'funded';
            await paymentRepo.save(escrow.payment);
          }
          
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'payout_processing_error',
            `Error al procesar pago para custodia ${escrow.id}: ${error.message}`,
            true
          );
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in processPendingPayouts:', error.message);
    }
  }

  /**
   * Sync blockchain statuses with database
   */
  async syncBlockchainStatuses(): Promise<void> {
    try {
      console.log('⛓️ Syncing blockchain statuses with database...');
      
      if (!AppDataSource.isInitialized) {
        console.warn('⚠️ Database not initialized, skipping blockchain sync');
        return;
      }

      const escrowRepo = AppDataSource.getRepository(Escrow);
      const paymentRepo = AppDataSource.getRepository(Payment);
      
      // Find escrows that have smart contract IDs but need status verification
      const activeEscrows = await escrowRepo.find({
        where: [
          { status: 'funded', smart_contract_escrow_id: Not(IsNull()) },
          { status: 'active', smart_contract_escrow_id: Not(IsNull()) }
        ],
        relations: ['payment']
      });

      console.log(`📋 Found ${activeEscrows.length} escrows to sync with blockchain`);

      for (const escrow of activeEscrows) {
        try {
          if (!escrow.smart_contract_escrow_id) continue;
          
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
            await this.paymentService.logPaymentEvent(
              escrow.payment.id,
              'blockchain_sync',
              `Escrow ${escrow.id} status synced from blockchain: ${contractStatus}`,
              true
            );
          }
          
        } catch (error: any) {
          console.error(`❌ Failed to sync escrow ${escrow.id}:`, error.message);
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'blockchain_sync_error',
            `Failed to sync escrow ${escrow.id}: ${error.message}`,
            true
          );
        }
      }
      
      console.log('✅ Blockchain synchronization completed');
      
    } catch (error: any) {
      console.error('❌ Error in syncBlockchainStatuses:', error.message);
    }
  }

  /**
   * Trigger automatic payout after escrow release
   */
  private async triggerAutomaticPayout(paymentId: number): Promise<void> {
    console.log(`🚀 Payout automático programado para pago ${paymentId}`);
  }

  stopAutomation(): void {
    console.log('🛑 Deteniendo automatización de pagos...');
    // Note: node-cron doesn't have a built-in stop all, 
    // but we can implement flags to disable processing
  }

  private async withdrawFromJunoToBridge(amount: number): Promise<void> {
    const networkConfig = getCurrentNetworkConfig();
    const JUNO_ENV = networkConfig.junoEnv;
    const JUNO_API_KEY = networkConfig.junoApiKey;
    const JUNO_API_SECRET = process.env.JUNO_API_SECRET!; // Keep secret in env
    const BASE_URL = JUNO_ENV === 'production' ? process.env.JUNO_PROD_BASE_URL! : process.env.JUNO_STAGE_BASE_URL!;
    const DESTINATION_ADDRESS = getCurrentNetworkConfig().bridgeWallet;

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
    const signature = createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

    const headers = {
      'X-Api-Key': JUNO_API_KEY,
      'X-Nonce': nonce,
      'X-Signature': signature
    };

    const response = await axios.post(url, bodyObj, { headers });
    console.log(`💰 Juno withdrawal successful: ${JSON.stringify(response.data)}`);
  }

  private async transferBridgeToJuno(amount: number): Promise<string> {
    const networkConfig = getCurrentNetworkConfig();
    const MXNB_TOKEN = networkConfig.mxnbTokenAddress; // Use network-aware token address
    const BRIDGE_WALLET_PK = networkConfig.privateKey; // 🚨 FIX: Use network-aware bridge wallet private key
    const PROVIDER_URL = networkConfig.rpcUrl;
    const JUNO_WALLET = networkConfig.junoWallet; // ✅ FIXED: Use network-aware Juno wallet

    if (!BRIDGE_WALLET_PK || !JUNO_WALLET) {
      throw new Error('Missing bridge wallet private key or Juno wallet address in .env');
    }

    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
    const tokenContract = new ethers.Contract(MXNB_TOKEN, ['function transfer(address to, uint256 amount)'], wallet);

    const decimals = 6; // MXNB uses 6 decimals, not 18!
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    const tx = await tokenContract.transfer(JUNO_WALLET, amountInWei);
    await tx.wait();

    console.log(`✅ Transferred ${amount} MXNB to Juno wallet. Tx: ${tx.hash}`);
    return tx.hash;
  }

  /**
   * Check if a payment has a pre-approved multi-sig transaction
   */
  private async checkForPreApprovedTransaction(paymentId: number): Promise<any | null> {
    try {
      // Get pending approvals for this payment
      const pendingApprovals = await multiSigApprovalService.getPendingApprovals();
      const approval = pendingApprovals.find(a => a.paymentId === paymentId.toString());
      
      if (!approval) {
        return null;
      }
      
      // Get transaction details which include signatures
      const transactionDetails = await multiSigApprovalService.getTransactionDetails(approval.id);
      const signatures = transactionDetails?.signatures || [];
      
      return {
        ...approval,
        current_signatures: signatures.length,
        required_signatures: approval.requiredSignatures,
        isFullySigned: signatures.length >= approval.requiredSignatures,
        signatures
      };
    } catch (error: any) {
      console.error(`Error checking pre-approved transaction for payment ${paymentId}:`, error.message);
      return null;
    }
  }
  
  /**
   * Execute a pre-approved multi-sig transaction
   */
  private async executePreApprovedTransaction(escrow: Escrow, approvalId: string): Promise<void> {
    try {
      const escrowRepo = AppDataSource.getRepository(Escrow);
      const paymentRepo = AppDataSource.getRepository(Payment);
      
      console.log(`🚀 Executing pre-approved multi-sig transaction ${approvalId} for Payment ${escrow.payment.id}`);
      
      // Execute the multi-sig transaction
      // Use the first multi-sig owner address as executor (has private key configured)
      const executorAddress = '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f'; // MULTISIG_OWNER_1
      const executionTxHash = await multiSigApprovalService.executeTransaction(
        approvalId,
        executorAddress
      );
      
      // Update escrow status to released and store transaction hash
      escrow.status = 'released';
      escrow.release_tx_hash = executionTxHash;
      await escrowRepo.save(escrow);
      
      // Update payment status and multi-sig status
      escrow.payment.status = 'completed'; // Mark as completed since escrow is released
      escrow.payment.multisig_status = 'executed'; // Update multi-sig status
      await paymentRepo.save(escrow.payment);
      
      // Log the successful execution
      await this.paymentService.logPaymentEvent(
        escrow.payment.id,
        'escrow_released_multisig',
        `Pre-approved multi-sig transaction executed. Approval: ${approvalId}, Tx: ${executionTxHash}`,
        true
      );
      
      console.log(`✅ Pre-approved transaction ${approvalId} executed for Payment ${escrow.payment.id}. Tx: ${executionTxHash}`);
      
      // Send notifications
      await this.handleDirectReleaseNotifications(escrow, executionTxHash);
      
      // Process final payouts (seller commission, etc.)
      await this.processPendingPayouts();
      
    } catch (error: any) {
      console.error(`❌ Failed to execute pre-approved transaction ${approvalId} for payment ${escrow.payment.id}:`, error.message);
      
      // Log the execution error
      await this.paymentService.logPaymentEvent(
        escrow.payment.id,
        'escrow_release_error',
        `Pre-approved transaction ${approvalId} execution failed: ${error.message}`,
        true
      );
      
      throw error;
    }
  }

  /**
   * Handle escrow release that requires multi-sig approval
   */
  private async handleMultiSigRequired(escrow: Escrow, route: any): Promise<void> {
    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      
      // 🚀 FIRST: Check if there's already a pre-approved transaction
      if (escrow.payment.multisig_approval_id) {
        console.log(`🔍 Checking pre-approval ${escrow.payment.multisig_approval_id} for Payment ${escrow.payment.id}`);
        
        const preApproval = await multiSigApprovalService.getTransactionDetails(
          escrow.payment.multisig_approval_id.toString()
        );
        
        if (preApproval && preApproval.status === 'approved') {
          console.log(`✅ Pre-approval ${preApproval.id} is ready for execution!`);
          
          // Execute the pre-approved transaction immediately
          await this.executePreApprovedTransaction(escrow, preApproval.id);
          return; // Exit early - transaction executed
        } else if (preApproval && preApproval.status === 'pending') {
          console.log(`⏳ Pre-approval ${preApproval.id} still pending signatures (${preApproval.currentSignatures}/${preApproval.requiredSignatures})`);
          
          // Log that we're waiting for signatures
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'escrow_release_waiting',
            `Waiting for multi-sig signatures on pre-approval ${preApproval.id} (${preApproval.currentSignatures}/${preApproval.requiredSignatures} signed)`,
            true
          );
          
          return; // Exit - waiting for more signatures
        }
      }
      
      // 📝 FALLBACK: Create new approval request if no pre-approval exists
      console.log(`📝 Creating new multi-sig approval for Payment ${escrow.payment.id}`);
      
      // Payment remains 'escrowed' - multisig approval is tracked separately
      // Funds are still in escrow, only the approval process is pending
      
      // Create multi-sig approval request
      const multiSigTx = await multiSigApprovalService.proposeTransaction({
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
      await this.paymentService.logPaymentEvent(
        escrow.payment.id,
        'escrow_release_pending',
        `Multi-sig transaction created: ${multiSigTx.id}`,
        true
      );
      
      // Notify admins about the multi-sig requirement
      await this.notifyAdminsMultiSigRequired(escrow.payment);
      
      console.log(`🔐 Multi-sig transaction created for Payment ${escrow.payment.id}: ${multiSigTx.id}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to handle multi-sig requirement for payment ${escrow.payment.id}:`, error.message);
      
      // Log the multi-sig setup error
      await this.paymentService.logPaymentEvent(
        escrow.payment.id,
        'escrow_release_error',
        `Failed to create multi-sig transaction: ${error.message}`,
        true
      );
    }
  }
  
  /**
   * Release escrow directly (for transactions below multi-sig threshold)
   */
  private async releaseEscrowDirectly(escrow: Escrow): Promise<string> {
    const escrowRepo = AppDataSource.getRepository(Escrow);
    
    // Call smart contract release function
    console.log(`🔗 Calling smart contract release for escrow ID ${escrow.smart_contract_escrow_id}`);
    const releaseTxHash = await releaseEscrow(Number(escrow.smart_contract_escrow_id));
    
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
  private async notifyAdminsMultiSigRequired(payment: Payment): Promise<void> {
    try {
      // Create in-app notifications for multi-sig requirement
      await createPaymentNotifications(payment.id, 'escrow_executing');
      console.log(`📧 Multi-sig approval notification sent for Payment ${payment.id}`);
      
      // Send email notification to admins
      const adminEmails = [
        { email: 'rodrigojille6@gmail.com', role: 'admin' }
      ];
      
      await sendPaymentEventNotification({
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
      
    } catch (error: any) {
      console.error(`⚠️ Failed to send multi-sig approval notifications for payment ${payment.id}:`, error);
    }
  }
  
  /**
   * Execute approved multi-sig escrow release
   * This method will be called when multi-sig approval is complete
   */
  async executeApprovedMultiSigRelease(paymentId: number): Promise<void> {
    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      const escrowRepo = AppDataSource.getRepository(Escrow);
      
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
      const pendingApprovals = await multiSigApprovalService.getPendingApprovals();
      const approval = pendingApprovals.find(a => a.paymentId === paymentId.toString());
      
      if (!approval) {
        throw new Error(`No multi-sig approval found for payment ${paymentId}`);
      }
      
      // Execute the escrow release via multi-sig
      console.log(`🔐 Executing multi-sig approved escrow release for Payment ${paymentId}`);
      // Use the first multi-sig owner address as executor (has private key configured)
      const executorAddress = '0xe120e428b2bb7e28b21d2634ad1d601c6cd6b33f'; // MULTISIG_OWNER_1
      const releaseTxHash = await multiSigApprovalService.executeTransaction(approval.id, executorAddress);
      
      // Update escrow and payment status
      escrow.status = 'released';
      escrow.release_tx_hash = releaseTxHash;
      payment.status = 'completed';
      payment.multisig_status = 'approved'; // Admin tracking only
      
      await escrowRepo.save(escrow);
      await paymentRepo.save(payment);
      
      // Log the successful execution
      await this.paymentService.logPaymentEvent(
        paymentId,
        'escrow_release_success',
        `Multi-sig approved escrow release executed. Tx: ${releaseTxHash}`,
        true
      );
      
      console.log(`✅ Multi-sig escrow release executed for Payment ${paymentId}. Tx: ${releaseTxHash}`);
      
    } catch (error: any) {
      console.error(`❌ Failed to execute multi-sig escrow release for payment ${paymentId}:`, error.message);
      
      // Log the execution error
      await this.paymentService.logPaymentEvent(
        paymentId,
        'escrow_release_error',
        `Failed to execute multi-sig escrow release: ${error.message}`,
        true
      );
    }
  }
  
  /**
   * Handle notifications for direct escrow releases
   */
  private async handleDirectReleaseNotifications(escrow: Escrow, releaseTxHash: string): Promise<void> {
    try {
      // Log the release event with transaction hash
      await this.paymentService.logPaymentEvent(
        escrow.payment.id,
        'escrow_release_success',
        `Custodia ${escrow.smart_contract_escrow_id} liberada del contrato. Tx: ${releaseTxHash}`,
        true
      );
      
      // Create escrow release notification
      try {
        await createPaymentNotifications(escrow.payment.id, 'payment_released');
        console.log(`📧 Payment ${escrow.payment.id} escrow released - in-app notifications sent`);
      } catch (notificationError) {
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
          await sendPaymentEventNotification({
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
      } catch (emailError) {
        console.error(`⚠️ Failed to send escrow release email notifications for payment ${escrow.payment.id}:`, emailError);
      }
      
      console.log(`✅ Escrow ${escrow.id} released successfully.`);
      
    } catch (error: any) {
      console.error(`❌ Failed to handle direct release notifications for escrow ${escrow.id}:`, error.message);
    }
  }

  /**
   * Quick retry for very recent escrow failures (runs every 30 seconds)
   * Focuses on payments that failed in the last 2 minutes due to balance issues
   */
  async quickEscrowRetry(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        return;
      }

      const paymentRepo = AppDataSource.getRepository(Payment);
      const eventRepo = AppDataSource.getRepository(PaymentEvent);
      
      // Find payments that failed escrow creation in the last 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      console.log(`⚡ Quick retry: Looking for automation errors after ${twoMinutesAgo.toISOString()}`);
      
      const recentFailures = await eventRepo.find({
        where: {
          type: 'automation_error',
          created_at: MoreThan(twoMinutesAgo) // Fixed: should be MoreThan, not LessThan
        },
        order: { created_at: 'DESC' }
      });
      
      console.log(`⚡ Quick retry: Found ${recentFailures.length} recent automation errors`);
      
      const balanceFailures = recentFailures.filter(event => 
        event.description?.includes('Insufficient MXNB balance') ||
        event.description?.includes('transfer amount exceeds balance')
      );
      
      if (balanceFailures.length === 0) {
        return;
      }
      
      console.log(`⚡ Quick retry: Found ${balanceFailures.length} recent balance failures`);
      
      for (const failureEvent of balanceFailures.slice(0, 3)) { // Limit to 3 per cycle
        try {
          const payment = await paymentRepo.findOne({
            where: { id: failureEvent.paymentId },
            relations: ['escrow']
          });
          
          if (!payment || payment.status !== 'funded' || payment.escrow?.smart_contract_escrow_id) {
            continue; // Skip if payment not found, not funded, or escrow already exists
          }
          
          const custodyAmount = Number(payment.escrow?.custody_amount || 0);
          if (custodyAmount <= 0) continue;
          
          // Quick balance check
          const balanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
          if (!balanceCheck.hasBalance) {
            console.log(`⏳ Payment ${payment.id}: Still insufficient balance (${balanceCheck.currentBalance}/${balanceCheck.requiredBalance} MXNB)`);
            continue;
          }
          
          console.log(`⚡ Payment ${payment.id}: Balance now sufficient, attempting escrow creation`);
          await this.processEscrowCreationAndFunding(payment, custodyAmount);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'quick_retry_success',
            `Quick retry successful - escrow created after balance recovery`,
            true
          );
          
        } catch (error: any) {
          console.error(`❌ Quick retry failed for payment ${failureEvent.paymentId}:`, error.message);
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in quickEscrowRetry:', error.message);
    }
  }

  /**
   * Retry failed escrow creations for funded payments
   * This handles cases where MXNB balance was insufficient during initial automation
   */
  async retryFailedEscrowCreations(): Promise<void> {
    try {
      console.log('🔄 Starting retryFailedEscrowCreations...');
      
      if (!AppDataSource.isInitialized) {
        console.warn('⚠️ Database not initialized, skipping escrow retry');
        return;
      }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    
    // Find funded payments that don't have escrow created yet
    // and have been funded for more than 1 minute (reduced from 2 minutes for faster retries)
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
    console.log(`🔍 Looking for funded payments older than ${oneMinuteAgo.toISOString()}`);
    
    let fundedPayments;
    try {
      fundedPayments = await paymentRepo.find({
        where: {
          status: 'funded'
        },
        relations: ['escrow', 'user', 'seller']
      });
    } catch (error: any) {
      // Handle missing automation_state column gracefully
      if (error.message?.includes('automation_state')) {
        console.warn('⚠️ automation_state column not found, using fallback query');
        fundedPayments = await paymentRepo.createQueryBuilder('payment')
          .leftJoinAndSelect('payment.escrow', 'escrow')
          .leftJoinAndSelect('payment.user', 'user')
          .leftJoinAndSelect('payment.seller', 'seller')
          .where('payment.status = :status', { status: 'funded' })
          .select([
            'payment.id',
            'payment.status', 
            'payment.amount',
            'payment.updated_at',
            'escrow',
            'user',
            'seller'
          ])
          .getMany();
      } else {
        throw error;
      }
    }
    
    console.log(`📊 Found ${fundedPayments.length} total funded payments`);
    
    const paymentsNeedingEscrow = fundedPayments.filter(payment => {
      // Check if payment has escrow configuration but no smart contract created
      const hasEscrowConfig = payment.escrow && payment.escrow.custody_percent > 0;
      const noSmartContract = !payment.escrow?.smart_contract_escrow_id;
      const fundedLongEnough = payment.updated_at && payment.updated_at < oneMinuteAgo;
      
      console.log(`🔍 Payment ${payment.id}: hasEscrowConfig=${hasEscrowConfig}, noSmartContract=${noSmartContract}, fundedLongEnough=${fundedLongEnough}, updated_at=${payment.updated_at?.toISOString()}`);
      
      return hasEscrowConfig && noSmartContract && fundedLongEnough;
    });
      
      if (paymentsNeedingEscrow.length === 0) {
        console.log('ℹ️ No payments need escrow retry');
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
          
          console.log(`📋 Payment ${payment.id}: Found ${recentErrors.length} recent errors`);
          if (recentErrors.length > 0) {
            console.log(`📋 Most recent error: ${recentErrors[0].description}`);
          }
          
          // Check for balance-related errors (expanded detection)
          const hasRecentBalanceError = recentErrors.length > 0 && (
            recentErrors[0].description?.includes('transfer amount exceeds balance') ||
            recentErrors[0].description?.includes('Insufficient MXNB balance') ||
            recentErrors[0].description?.includes('insufficient funds')
          );
          
          // Always attempt retry for payments needing escrow, regardless of error type
          console.log(`🔄 Payment ${payment.id}: Attempting escrow creation retry...`);
          
          const totalAmount = Number(payment.amount);
          const custodyPercent = payment.escrow?.custody_percent || 0;
          const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
          
          console.log(`💰 Payment ${payment.id}: Amount=${totalAmount}, CustodyPercent=${custodyPercent}%, CustodyAmount=${custodyAmount}`);
          
          if (custodyAmount > 0) {
            // Check current balance before attempting
            const balanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
            console.log(`💳 Payment ${payment.id}: Balance check - Required: ${balanceCheck.requiredBalance}, Available: ${balanceCheck.currentBalance}, HasBalance: ${balanceCheck.hasBalance}`);
            
            if (!balanceCheck.hasBalance && hasRecentBalanceError) {
              console.log(`⏳ Payment ${payment.id}: Insufficient balance and recent balance error, waiting 30 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 30000));
            }
            
            // 🔄 IDEMPOTENCY CHECK: Only do Juno→Bridge withdrawal if bridge wallet needs more MXNB
            const currentBalanceCheck = await this.checkBridgeWalletBalance(custodyAmount);
            
            if (!currentBalanceCheck.hasBalance) {
              console.log(`🔄 Payment ${payment.id}: Bridge wallet needs funding (${currentBalanceCheck.currentBalance}/${currentBalanceCheck.requiredBalance} MXNB)`);
              console.log(`🔄 Payment ${payment.id}: Processing Juno→Bridge withdrawal...`);
              await this.processBridgeWithdrawal(payment, custodyAmount);
              console.log(`✅ Payment ${payment.id}: Juno→Bridge withdrawal completed`);
            } else {
              console.log(`✅ Payment ${payment.id}: Bridge wallet already has sufficient balance (${currentBalanceCheck.currentBalance}/${currentBalanceCheck.requiredBalance} MXNB) - skipping withdrawal`);
            }
            
            // 🔄 IDEMPOTENCY CHECK: Only create escrow if it doesn't already exist
            if (!payment.escrow?.smart_contract_escrow_id) {
              console.log(`🚀 Payment ${payment.id}: Creating escrow (no existing smart contract ID)...`);
              await this.processEscrowCreationAndFunding(payment, custodyAmount);
            } else {
              console.log(`✅ Payment ${payment.id}: Escrow already exists (ID: ${payment.escrow.smart_contract_escrow_id}) - skipping creation`);
            }
            
            await this.paymentService.logPaymentEvent(
              payment.id,
              'escrow_retry_success',
              `Escrow creation retry successful`,
              true
            );
            
            console.log(`✅ Payment ${payment.id}: Escrow retry completed successfully`);
          } else {
            console.log(`⚠️ Payment ${payment.id}: Custody amount is 0, skipping`);
          }
          
        } catch (error: any) {
          console.error(`❌ Escrow retry failed for payment ${payment.id}:`, error.message);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'escrow_retry_error',
            `Escrow retry failed: ${error.message}`,
            false
          );
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in retryFailedEscrowCreations:', error.message);
    }
  }
}