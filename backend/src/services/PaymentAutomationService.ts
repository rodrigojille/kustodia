import { PaymentService } from './paymentService';
import { releaseEscrow, createEscrow } from './escrowService';
import { listJunoTransactions, redeemMXNBToMXN, withdrawMXNBToBridge, getRegisteredBankAccounts } from './junoService';
import { LessThan, Not, IsNull } from 'typeorm';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { createHmac } from 'node:crypto';
import axios from 'axios';
import { ethers } from 'ethers';

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

  constructor() {
    this.paymentService = new PaymentService();
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

    console.log('✅ Automatización iniciada exitosamente');
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
              } else {
                console.log(`⏩ Payment ${payment.id} was already processed. Skipping.`);
                return;
              }
            });

            // Note: Payment notifications would be sent here if implemented
            console.log(`📧 Payment ${payment.id} funded - notification system not implemented`);

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
      const paymentRepo = AppDataSource.getRepository(Payment);
      const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ['escrow', 'user', 'seller'] });

      if (!payment) throw new Error(`Payment ${paymentId} not found`);
      if (payment.status !== 'funded') throw new Error(`Payment ${paymentId} not in 'funded' status`);

      const totalAmount = Number(payment.amount);
      const custodyPercent = payment.escrow?.custody_percent || 0;
      const custodyAmount = Math.round(totalAmount * (custodyPercent / 100));
      const payoutAmount = totalAmount - custodyAmount;

      if (payoutAmount > 0) await this.processSellerRedemption(payment, payoutAmount);
      if (custodyAmount > 0) {
        await this.processBridgeWithdrawal(payment, custodyAmount);
        await this.processEscrowCreationAndFunding(payment, custodyAmount);
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
   */
  private async processSellerRedemption(payment: Payment, amount: number): Promise<void> {
    try {
      // Step 1: Transfer MXNB from bridge wallet to Juno wallet
      console.log(`💸 Transferring ${amount} MXNB from bridge wallet to Juno wallet...`);
      const bridgeTransferTxHash = await this.transferBridgeToJuno(amount);
      
      await this.paymentService.logPaymentEvent(
        payment.id,
        'bridge_to_juno_transfer',
        `Transferred ${amount} MXNB from bridge wallet to Juno wallet. TX: ${bridgeTransferTxHash}`,
        false
      );
      
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
      
      const bankAccounts = await getRegisteredBankAccounts();
      const destinationBankAccount = bankAccounts.find(account => account.id === payment.seller!.juno_bank_account_id);
      
      if (!destinationBankAccount) {
        throw new Error(`Seller's bank account ${payment.seller.juno_bank_account_id} not found in registered accounts`);
      }
      const redemptionResult = await redeemMXNBToMXN(amount, destinationBankAccount.id);
      
      await this.paymentService.logPaymentEvent(
        payment.id,
        'spei_redemption_initiated',
        `SPEI redemption of ${amount} MXN to ${destinationBankAccount.clabe}. Tx ID: ${redemptionResult.id}`,
        false
      );
      
      console.log(`✅ SPEI redemption initiated for payment ${payment.id}`);
      
    } catch (error: any) {
      console.error(`❌ Seller redemption failed for payment ${payment.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Process MXNB withdrawal to bridge wallet
   */
  private async processBridgeWithdrawal(payment: Payment, amount: number): Promise<void> {
    try {
      const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET!;
      if (!bridgeWallet) throw new Error('ESCROW_BRIDGE_WALLET not set in .env');

      await withdrawMXNBToBridge(amount, bridgeWallet);

      await this.paymentService.logPaymentEvent(
        payment.id,
        'bridge_withdrawal_initiated',
        `Withdrawal of ${amount} MXNB to bridge wallet initiated.`,
        true
      );
      console.log(`✅ Bridge withdrawal for payment ${payment.id} initiated`);
    } catch (error: any) {
      console.error(`❌ Bridge withdrawal failed for payment ${payment.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Create and fund the escrow contract after bridge withdrawal
   */
  private async processEscrowCreationAndFunding(payment: Payment, custodyAmount: number): Promise<void> {
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const tokenAddress = process.env.MXNB_TOKEN_ADDRESS!;
    const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET!;

    if (!payment.escrow) throw new Error(`Payment ${payment.id} missing escrow relation`);
    if (!payment.escrow.custody_end) throw new Error(`Payment ${payment.id} escrow missing custody_end date`);
    if (!payment.seller?.wallet_address) throw new Error(`Payment ${payment.id} missing seller wallet address`);

    const deadline = Math.floor(payment.escrow.custody_end.getTime() / 1000);

    try {
      const createResult = await createEscrow({
        payer: bridgeWallet,
        payee: payment.seller.wallet_address,
        token: tokenAddress,
        amount: custodyAmount.toString(),
        deadline: deadline,
        vertical: payment.vertical_type || '',
        clabe: payment.deposit_clabe || '',
        conditions: ''
      });

      if (!createResult?.escrowId) throw new Error('Escrow creation failed to return a valid ID.');

      payment.escrow.smart_contract_escrow_id = createResult.escrowId;
      payment.escrow.blockchain_tx_hash = createResult.txHash;
      payment.escrow.status = 'active';
      payment.status = 'escrowed';

      await escrowRepo.save(payment.escrow);
      await paymentRepo.save(payment);

      await this.paymentService.logPaymentEvent(
        payment.id,
        'escrow_created',
        `Escrow ${createResult.escrowId} created. Tx: ${createResult.txHash}`,
        true
      );

      // Note: Payment notifications would be sent here if implemented
      console.log(`📧 Payment ${payment.id} escrow created notification - system not implemented`);
      console.log(`✅ Escrow ${createResult.escrowId} created and payment ${payment.id} updated to 'escrowed'`);

    } catch (error: any) {
      console.error(`❌ Escrow creation failed for payment ${payment.id}:`, error.message);
      await this.paymentService.logPaymentEvent(payment.id, 'escrow_error', `Escrow creation failed: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * Process Juno withdrawals to bridge wallet for escrow funding (DEPRECATED - logic moved)
   */
  async processJunoWithdrawals(): Promise<void> { /* Logic handled by processBridgeWithdrawal */ }

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
      const expiredEscrows = await escrowRepo.find({
        where: [
          {
            status: 'funded',
            custody_end: LessThan(now),
            payment: {
              payment_type: Not('nuevo_flujo') // Traditional payments only
            }
          },
          {
            status: 'active',
            custody_end: LessThan(now),
            payment: {
              payment_type: Not('nuevo_flujo') // Traditional payments only
            }
          },
          {
            status: 'active',
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
          
          console.log(`🔓 Releasing escrow ${escrow.id} for payment ${escrow.payment.id}`);
          
          // Validate escrow is actually funded on-chain before attempting release
          if (!escrow.smart_contract_escrow_id) {
            console.error(`❌ Escrow ${escrow.id} has no smart contract ID, skipping`);
            continue;
          }
          
          console.log(`🔍 Validating on-chain funding for escrow ID ${escrow.smart_contract_escrow_id}`);
          
          // Call smart contract release function
          console.log(`🔗 Calling smart contract release for escrow ID ${escrow.smart_contract_escrow_id}`);
          const releaseTxHash = await releaseEscrow(Number(escrow.smart_contract_escrow_id));
          
          // Update escrow status to released and store transaction hash
          escrow.status = 'released';
          escrow.release_tx_hash = releaseTxHash;
          await escrowRepo.save(escrow);
          
          // Log the release event with transaction hash
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'escrow_released',
            `Escrow ${escrow.id} released automatically. TX: ${releaseTxHash}`,
            false
          );
          
          console.log(`✅ Escrow ${escrow.id} released successfully.`);
          
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
        relations: ['payment']
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
              `Payout completed successfully. SPEI sent to recipient.`,
              false
            );
            
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
            `Payout failed: ${errorMessage}`,
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
            `Failed to process payout for escrow ${escrow.id}: ${error.message}`,
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
    const JUNO_ENV = process.env.JUNO_ENV || 'stage';
    const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
    const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
    const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    const DESTINATION_ADDRESS = process.env.ESCROW_BRIDGE_WALLET!;

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
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
    const BRIDGE_WALLET_PK = process.env.ESCROW_PRIVATE_KEY;
    const PROVIDER_URL = process.env.ETH_RPC_URL;
    const JUNO_WALLET = process.env.JUNO_WALLET;

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
}