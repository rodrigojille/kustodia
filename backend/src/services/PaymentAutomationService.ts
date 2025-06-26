import { PaymentService } from './paymentService';
import { releaseEscrow, getEscrow } from './escrowService';
import { listJunoTransactions, redeemMXNbForMXN, sendJunoPayment } from './junoService';
import { LessThan, DataSource } from 'typeorm';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import * as cron from 'node-cron';
import ormconfig from '../ormconfig';
import { ethers } from "ethers";
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

interface JunoTransaction {
  id: string;
  transaction_type: string;
  status: string;
  amount: number;
  clabe: string;
  created_at: string;
}

export class PaymentAutomationService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Get database connection with proper error handling
   */
  private getDataSource(): DataSource | null {
    try {
      if (!ormconfig.isInitialized) {
        console.warn('⚠️ Database not initialized');
        return null;
      }
      return ormconfig;
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return null;
    }
  }

  /**
   * Initialize all automation processes
   */
  async startAutomation(): Promise<void> {
    console.log('🤖 Iniciando servicios de automatización de pagos...');

    // Every 5 minutes: Check for deposits and process payments
    cron.schedule('*/5 * * * *', async () => {
      await this.processNewDeposits();
    });

    // Every 7 minutes: Process Juno withdrawals to bridge wallet
    cron.schedule('*/7 * * * *', async () => {
      await this.processJunoWithdrawals();
    });

    // Every 10 minutes: Release expired custodies
    cron.schedule('*/10 * * * *', async () => {
      await this.releaseExpiredCustodies();
    });

    // Every 15 minutes: Process pending payouts
    cron.schedule('*/15 * * * *', async () => {
      await this.processPendingPayouts();
    });

    // Every hour: Sync status with blockchain
    cron.schedule('0 * * * *', async () => {
      await this.syncBlockchainStatuses();
    });

    console.log('✅ Automatización iniciada exitosamente');
  }

  /**
   * AUTOMATION 1: Detect new deposits and trigger payment processing
   */
  async processNewDeposits(): Promise<void> {
    try {
      console.log('🔍 Revisando nuevos depósitos SPEI...');
      
      // Check if database connection exists
      const dataSource = this.getDataSource();
      if (!dataSource) {
        console.warn('⚠️ Database not initialized, skipping deposit processing');
        return;
      }

      const paymentRepo = dataSource.getRepository(Payment);
      const pendingPayments = await paymentRepo.find({
        where: { status: 'pending' },
        relations: ['user', 'escrow']
      });

      const junoTransactions: JunoTransaction[] = await listJunoTransactions();
      let processedCount = 0;

      for (const payment of pendingPayments) {
        // Find matching deposit transaction
        const matchingDeposit = junoTransactions.find((tx: JunoTransaction) => 
          tx.transaction_type === 'ISSUANCE' && 
          tx.status === 'SUCCEEDED' &&
          Number(tx.amount) === payment.amount &&
          tx.clabe === payment.deposit_clabe
        );

        if (matchingDeposit && !payment.reference) {
          // Atomic claim to prevent race conditions
          const result = await paymentRepo.createQueryBuilder()
            .update()
            .set({ 
              status: 'processing',
              reference: matchingDeposit.id,
              transaction_id: matchingDeposit.id
            })
            .where('id = :id AND status = :status', { 
              id: payment.id, 
              status: 'pending' 
            })
            .execute();

          if (result.affected === 1) {
            await this.paymentService.logPaymentEvent(
              payment.id, 
              'deposito_detectado', 
              `Depósito SPEI detectado: ${matchingDeposit.id}`
            );

            // Trigger full payment lifecycle
            await this.paymentService.processFullPaymentLifecycle(payment.id);
            processedCount++;
            
            console.log(`✅ Pago ${payment.id} procesado automáticamente`);
          }
        }
      }

      if (processedCount > 0) {
        console.log(`🎉 ${processedCount} pagos procesados automáticamente`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      console.error('❌ Error procesando nuevos depósitos:', errorMessage);
    }
  }

  /**
   * NEW AUTOMATION: Process Juno withdrawals to bridge wallet for escrow funding
   */
  async processJunoWithdrawals(): Promise<void> {
    try {
      console.log('💰 Procesando retiros de Juno a wallet puente...');
      
      const dataSource = this.getDataSource();
      if (!dataSource) {
        console.warn('⚠️ Database not initialized, skipping Juno withdrawals');
        return;
      }

      const paymentRepo = dataSource.getRepository(Payment);
      const escrowRepo = dataSource.getRepository(Escrow);
      
      // Find payments that need MXNB withdrawal from Juno
      const paymentsNeedingWithdrawal = await paymentRepo.find({
        where: { status: 'processing' },
        relations: ['escrow']
      });

      let processedCount = 0;

      for (const payment of paymentsNeedingWithdrawal) {
        try {
          // Check if escrow exists and needs funding
          if (!payment.escrow || payment.escrow.status !== 'pending') {
            continue;
          }

          // Perform Juno withdrawal to bridge wallet
          await this.withdrawFromJunoToBridge(payment.amount);
          
          // Update payment status to indicate withdrawal completed
          payment.status = 'withdrawn';
          await paymentRepo.save(payment);

          await this.paymentService.logPaymentEvent(
            payment.id,
            'juno_withdrawal',
            `MXNB withdrawn from Juno to bridge wallet: ${payment.amount}`
          );

          processedCount++;
          console.log(`✅ Retiro Juno completado para pago ${payment.id}`);
        } catch (error: any) {
          console.error(`❌ Error en retiro Juno para pago ${payment.id}:`, error.message);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'juno_withdrawal_error',
            `Error en retiro Juno: ${error.message}`
          );
        }
      }

      if (processedCount > 0) {
        console.log(`🎉 ${processedCount} retiros de Juno procesados`);
      }
    } catch (error: any) {
      console.error('❌ Error procesando retiros de Juno:', error.message);
    }
  }

  /**
   * Helper: Withdraw MXNB from Juno to bridge wallet
   */
  private async withdrawFromJunoToBridge(amount: number): Promise<void> {
    const JUNO_ENV = process.env.JUNO_ENV || 'stage';
    const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
    const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
    const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    const DESTINATION_ADDRESS = process.env.ESCROW_BRIDGE_WALLET!;

    const endpoint = '/mint_platform/v1/crypto_withdrawals';
    const url = `${BASE_URL}${endpoint}`;

    const bodyObj = {
      amount: amount.toString(),
      asset: 'mxnbj',
      destination_address: DESTINATION_ADDRESS,
      blockchain_network: 'arbitrum'
    };

    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };

    const response = await axios.post(url, bodyObj, { headers });
    console.log(`💰 Juno withdrawal successful: ${response.data}`);
  }

  /**
   * Helper: Transfer MXNB from bridge wallet to Juno
   */
  private async transferBridgeToJuno(amount: number): Promise<void> {
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
    const BRIDGE_WALLET_PK = process.env.ESCROW_PRIVATE_KEY; // Using escrow private key for bridge operations
    const PROVIDER_URL = process.env.ETH_RPC_URL;
    const JUNO_WALLET = process.env.JUNO_WALLET;

    if (!BRIDGE_WALLET_PK || !JUNO_WALLET) {
      throw new Error('Missing bridge wallet private key or Juno wallet address');
    }

    const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
    const signer = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
    
    const ERC20_ABI = [
      "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    
    const token = new ethers.Contract(MXNB_TOKEN, ERC20_ABI, signer);
    const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), 6); // MXNB uses 6 decimals

    const tx = await token.transfer(JUNO_WALLET, amountWithDecimals);
    console.log(`🔄 Bridge to Juno transfer tx: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ MXNB transferred to Juno wallet: ${amount}`);
  }

  /**
   * AUTOMATION 2: Automatically release expired custodies
   */
  async releaseExpiredCustodies(): Promise<void> {
    try {
      console.log('⏰ Revisando custodias expiradas...');
      
      // Check if database connection exists
      const dataSource = this.getDataSource();
      if (!dataSource) {
        console.warn('⚠️ Database not initialized, skipping custody release');
        return;
      }
      
      const escrowRepo = dataSource.getRepository(Escrow);
      const expiredEscrows = await escrowRepo.find({
        where: {
          status: 'active',
          custody_end: LessThan(new Date())
        },
        relations: ['payment', 'payment.user']
      });

      let releasedCount = 0;

      for (const escrow of expiredEscrows) {
        try {
          // Check if smart_contract_escrow_id exists
          if (!escrow.smart_contract_escrow_id) {
            console.warn(`⚠️ Escrow ${escrow.id} no tiene smart_contract_escrow_id`);
            continue;
          }

          // Release escrow on blockchain
          await releaseEscrow(Number(escrow.smart_contract_escrow_id));
          
          // Update database status
          escrow.status = 'released';
          escrow.release_tx_hash = 'auto-released-' + Date.now();
          await escrowRepo.save(escrow);

          // Log event
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'escrow_auto_liberado',
            'Custodia liberada automáticamente al vencer el período'
          );

          // Trigger automatic payout
          await this.triggerAutomaticPayout(escrow.payment.id);
          
          releasedCount++;
          console.log(`✅ Escrow ${escrow.id} liberado automáticamente`);
        } catch (error: any) {
          const errorMessage = error.message || 'Error desconocido';
          console.error(`❌ Error liberando escrow ${escrow.id}:`, errorMessage);
          
          // Log error event
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'error_liberacion_automatica',
            `Error en liberación automática: ${errorMessage}`
          );
        }
      }

      if (releasedCount > 0) {
        console.log(`🎉 ${releasedCount} custodias liberadas automáticamente`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      console.error('❌ Error liberando custodias expiradas:', errorMessage);
    }
  }

  /**
   * AUTOMATION 3: Process pending payouts (MXNB redemption + SPEI)
   */
  async processPendingPayouts(): Promise<void> {
    try {
      console.log('💸 Procesando pagos pendientes...');
      
      const dataSource = this.getDataSource();
      if (!dataSource) {
        console.warn('⚠️ Database not initialized, skipping pending payouts');
        return;
      }

      const paymentRepo = dataSource.getRepository(Payment);
      const escrowRepo = dataSource.getRepository(Escrow);
      
      // Find escrows that are released and ready for payout
      const releasedEscrows = await escrowRepo.find({
        where: { status: 'released' },
        relations: ['payment', 'payment.user']
      });

      let processedCount = 0;

      for (const escrow of releasedEscrows) {
        try {
          const payment = escrow.payment;
          
          // 🔥 NEW: Transfer MXNB from bridge wallet to Juno first
          await this.transferBridgeToJuno(escrow.release_amount || escrow.custody_amount);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'bridge_to_juno_transfer',
            `MXNB transferred from bridge to Juno: ${escrow.release_amount || escrow.custody_amount}`
          );

          // Wait a moment for the transfer to be confirmed
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

          // 1. Redeem MXNB for MXN via Juno
          const redemptionResult = await redeemMXNbForMXN(escrow.release_amount || escrow.custody_amount);
          console.log(`💱 MXNB redemption result for payment ${payment.id}:`, redemptionResult);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'mxnb_redemption',
            `MXNB redeemed for MXN: ${escrow.release_amount || escrow.custody_amount}`
          );

          // 2. Send SPEI payment to recipient
          if (payment.payout_clabe) {
            const speiResult = await sendJunoPayment(
              payment.payout_clabe,
              escrow.release_amount || escrow.custody_amount,
              `Pago Kustodia #${payment.id}`
            );
            console.log(`💸 SPEI result for payment ${payment.id}:`, speiResult);

            await this.paymentService.logPaymentEvent(
              payment.id,
              'spei_completado',
              `Transferencia SPEI realizada a ${payment.payout_clabe}`
            );
          }

          // 3. Update payment and escrow status
          payment.status = 'completed';
          escrow.status = 'completed';
          
          await paymentRepo.save(payment);
          await escrowRepo.save(escrow);

          await this.paymentService.logPaymentEvent(
            payment.id,
            'pago_completado',
            'Pago completado automáticamente'
          );

          processedCount++;
          console.log(`✅ Pago ${payment.id} completado automáticamente`);
        } catch (error: any) {
          const errorMessage = error.message || 'Error desconocido';
          console.error(`❌ Error completando pago ${escrow.payment.id}:`, errorMessage);
          
          await this.paymentService.logPaymentEvent(
            escrow.payment.id,
            'error_pago_automatico',
            `Error en pago automático: ${errorMessage}`
          );
        }
      }

      if (processedCount > 0) {
        console.log(`🎉 ${processedCount} pagos completados automáticamente`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      console.error('❌ Error procesando pagos pendientes:', errorMessage);
    }
  }

  /**
   * AUTOMATION 4: Sync blockchain statuses with database
   */
  async syncBlockchainStatuses(): Promise<void> {
    try {
      console.log('🔄 Sincronizando estados con blockchain...');
      
      // Check if database connection exists
      const dataSource = this.getDataSource();
      if (!dataSource) {
        console.warn('⚠️ Database not initialized, skipping blockchain sync');
        return;
      }
      
      const escrowRepo = dataSource.getRepository(Escrow);
      const activeEscrows = await escrowRepo.find({
        where: { status: 'active' },
        relations: ['payment']
      });

      let syncedCount = 0;

      for (const escrow of activeEscrows) {
        try {
          // Check if smart_contract_escrow_id exists
          if (!escrow.smart_contract_escrow_id) {
            console.warn(`⚠️ Escrow ${escrow.id} no tiene smart_contract_escrow_id`);
            continue;
          }

          const blockchainEscrow = await getEscrow(Number(escrow.smart_contract_escrow_id));
          
          // Check if escrow is released on blockchain but not in database
          if (blockchainEscrow && blockchainEscrow.status === 2 && escrow.status === 'active') { // Status 2 = released
            escrow.status = 'released';
            await escrowRepo.save(escrow);

            await this.paymentService.logPaymentEvent(
              escrow.payment.id,
              'estado_sincronizado',
              'Estado sincronizado con blockchain: liberado'
            );

            syncedCount++;
            console.log(`✅ Escrow ${escrow.id} sincronizado: released`);
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Error desconocido';
          console.error(`❌ Error sincronizando escrow ${escrow.id}:`, errorMessage);
        }
      }

      if (syncedCount > 0) {
        console.log(`🎉 ${syncedCount} escrows sincronizados con blockchain`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      console.error('❌ Error sincronizando con blockchain:', errorMessage);
    }
  }

  /**
   * Helper: Trigger automatic payout after escrow release
   */
  private async triggerAutomaticPayout(paymentId: number): Promise<void> {
    // This will be picked up by the processPendingPayouts automation
    console.log(`🚀 Payout automático programado para pago ${paymentId}`);
  }

  /**
   * Manual override: Stop all automation
   */
  stopAutomation(): void {
    console.log('🛑 Deteniendo automatización de pagos...');
    // Note: node-cron doesn't have a built-in stop all, 
    // but we can implement flags to disable processing
  }
}
