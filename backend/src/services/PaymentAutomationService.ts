import { PaymentService } from './paymentService';
import { releaseEscrow, getEscrow } from './escrowService';
import { listJunoTransactions, redeemMXNbForMXN, sendJunoPayment } from './junoService';
import { LessThan } from 'typeorm';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import * as cron from 'node-cron';
import ormconfig from '../ormconfig';

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
   * Initialize all automation processes
   */
  async startAutomation(): Promise<void> {
    console.log('🤖 Iniciando servicios de automatización de pagos...');

    // Every 5 minutes: Check for deposits and process payments
    cron.schedule('*/5 * * * *', async () => {
      await this.processNewDeposits();
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
      if (!ormconfig) {
        console.warn('⚠️ Database not initialized, skipping deposit processing');
        return;
      }

      const paymentRepo = ormconfig.getRepository(Payment);
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
   * AUTOMATION 2: Automatically release expired custodies
   */
  async releaseExpiredCustodies(): Promise<void> {
    try {
      console.log('⏰ Revisando custodias expiradas...');
      
      // Check if database connection exists
      if (!ormconfig) {
        console.warn('⚠️ Database not initialized, skipping custody release');
        return;
      }
      
      const escrowRepo = ormconfig.getRepository(Escrow);
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
      
      // Check if database connection exists
      if (!ormconfig) {
        console.warn('⚠️ Database not initialized, skipping payout processing');
        return;
      }
      
      const escrowRepo = ormconfig.getRepository(Escrow);
      const paymentRepo = ormconfig.getRepository(Payment);
      
      const releasedEscrows = await escrowRepo.find({
        where: { status: 'released' },
        relations: ['payment', 'payment.user']
      });

      let processedCount = 0;

      for (const escrow of releasedEscrows) {
        try {
          const payment = escrow.payment;
          
          // 1. Redeem MXNB tokens to MXN
          await redeemMXNbForMXN(escrow.release_amount);
          
          await this.paymentService.logPaymentEvent(
            payment.id,
            'mxnb_redimido',
            `${escrow.release_amount} MXNB redimidos a MXN`
          );

          // 2. Transfer MXN via SPEI to seller
          if (payment.payout_clabe) {
            await sendJunoPayment(
              payment.payout_clabe,
              escrow.release_amount,
              `Pago Kustodia #${payment.id}`
            );

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
      if (!ormconfig) {
        console.warn('⚠️ Database not initialized, skipping blockchain sync');
        return;
      }
      
      const escrowRepo = ormconfig.getRepository(Escrow);
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
