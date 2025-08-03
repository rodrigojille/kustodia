import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { redeemMXNbForMXN } from './junoService'; // Correct import for the redemption function
import AppDataSource from '../ormconfig';

export class PaymentService {
  // 1. Detectar y registrar depósito SPEI
  async logPaymentEvent(paymentId: number, type: string, description?: string, isAutomatic: boolean = false): Promise<void> {
    const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);
    const event = paymentEventRepo.create({ paymentId, type, description, is_automatic: isAutomatic });
    await paymentEventRepo.save(event);
  }

  async processDeposit(clabe: string, amount: number): Promise<Payment | null> {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({ where: { payout_clabe: clabe, amount, status: 'processing' } });
    if (!payment) return null;
    payment.status = 'funded';
    await paymentRepo.save(payment);
    await this.logPaymentEvent(payment.id, 'funded', 'Depósito SPEI detectado y fondeado.');
    // Ensure returned object matches Payment entity
    if (!payment.id || !payment.user || !payment.amount) {
      throw new Error('Payment entity missing required properties (id, user, amount)');
    }
    return payment;
  }

  // 2. Redimir y pagar SPEI inicial (fuera de custodia)
  async redeemAndPayout(payment: Payment): Promise<void> {
    const releaseAmount = payment.escrow?.release_amount;
    if (!releaseAmount || releaseAmount <= 0) {
      await this.logPaymentEvent(payment.id, 'payout_skipped', 'No release amount to pay out.');
      return;
    }

    // Case 1: Handle commission payout if applicable
    if (payment.commission_amount && payment.commission_amount > 0 && payment.commission_beneficiary_juno_bank_account_id) {
      const commissionAmount = payment.commission_amount;
      const sellerAmount = releaseAmount - commissionAmount;

      // Payout 1: Commission
      try {
        await redeemMXNbForMXN(commissionAmount, payment.commission_beneficiary_juno_bank_account_id);
        await this.logPaymentEvent(payment.id, 'commission_paid', `Comisión de ${commissionAmount} MXN pagada a la cuenta de Juno ${payment.commission_beneficiary_juno_bank_account_id}.`);
      } catch (error) {
        await this.logPaymentEvent(payment.id, 'commission_failed', `Error al pagar comisión: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Payout 2: Seller (remaining amount)
      if (sellerAmount > 0) {
        try {
          if (!payment.payout_juno_bank_account_id) throw new Error('Missing Juno bank account ID for seller payout.');
          await redeemMXNbForMXN(sellerAmount, payment.payout_juno_bank_account_id);
          await this.logPaymentEvent(payment.id, 'seller_paid', `Pago de ${sellerAmount} MXN pagado a la cuenta de Juno ${payment.payout_juno_bank_account_id}.`);
        } catch (error) {
          await this.logPaymentEvent(payment.id, 'seller_payout_failed', `Error al pagar al vendedor: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

    } else {
      // Case 2: No commission, direct payout to seller
      try {
        if (!payment.payout_juno_bank_account_id) throw new Error('Missing Juno bank account ID for seller payout.');
        await redeemMXNbForMXN(releaseAmount, payment.payout_juno_bank_account_id);
        await this.logPaymentEvent(payment.id, 'seller_paid', `Pago de ${releaseAmount} MXN pagado a la cuenta de Juno ${payment.payout_juno_bank_account_id}.`);
      } catch (error) {
        await this.logPaymentEvent(payment.id, 'seller_payout_failed', `Error al pagar al vendedor: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 3. Retirar MXNB a bridge wallet
  async withdrawMXNBToBridge(payment: Payment): Promise<void> {
    // Llama a Juno withdrawal endpoint, registra eventos de inicio y confirmación
  }

  // 4. Fondear escrow en el contrato
  async fundEscrow(payment: Payment): Promise<Escrow | null> {
    try {
      if (!payment.escrow) {
        console.error('[PaymentService] No escrow found for payment', payment.id);
        return null;
      }

      const escrowId = payment.escrow.smart_contract_escrow_id;
      if (!escrowId) {
        console.error('[PaymentService] No smart contract escrow ID found', payment.escrow.id);
        return null;
      }

      console.log(`[PaymentService] Escrow ${escrowId} for payment ${payment.id} is already funded during creation`);
      
      // Escrow funding happens during createEscrow, so we just return the existing escrow
      return payment.escrow;
    } catch (error) {
      console.error('[PaymentService] Error funding escrow:', error);
      return null;
    }
  }

  // 5. Liberar escrow (trigger manual o automático)
  async releaseEscrow(payment: Payment): Promise<void> {
    // Llama a contrato para liberar, registra evento y guarda releaseTxHash
  }

  // 6. Payout SPEI final al vendedor (fondos liberados)
  async payoutEscrowRelease(payment: Payment): Promise<void> {
    // Llama a Juno para payout, registra eventos de inicio y confirmación
  }

  // 7. Sincronizar estados de payouts/redenciones y actualizar eventos
  async syncJunoStatuses(): Promise<void> {
    // Consulta Juno, actualiza PaymentEvents y estados en BD
  }

  // 8. Orquestador end-to-end
  async processFullPaymentLifecycle(paymentId: number): Promise<void> {
    const paymentRepo = AppDataSource.getRepository(Payment);
    let payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ['escrow'] });
    if (!payment) throw new Error('Payment not found');

    // Log: iniciando ciclo de pago
    await this.logPaymentEvent(payment.id, 'lifecycle_start', 'Iniciando ciclo completo de pago.');

    if (!payment.payout_clabe) {
      throw new Error('payout_clabe is undefined for payment ID ' + payment.id);
    }
    payment = await this.processDeposit(payment.payout_clabe, payment.amount) || payment;

    if (payment.status === 'funded') {
      await this.logPaymentEvent(payment.id, 'funded', 'Pago fondeado, inicia siguiente etapa.');
    }

    if (payment.amount > (payment.escrow?.custody_amount || 0)) {
      await this.redeemAndPayout(payment);
      await this.logPaymentEvent(payment.id, 'redeemed', 'Redención y payout inicial completados.');
    }

    await this.withdrawMXNBToBridge(payment);
    await this.logPaymentEvent(payment.id, 'mxnb_withdrawn', 'MXNB retirado a bridge wallet.');
    const escrow = await this.fundEscrow(payment);
    await this.logPaymentEvent(payment.id, 'escrow_funded', 'Escrow fondeado.');

    if (escrow && escrow.status === 'released') {
      await this.releaseEscrow(payment);
      await this.payoutEscrowRelease(payment);
      await this.logPaymentEvent(payment.id, 'escrow_released', 'Escrow liberado y payout final realizado.');
    }
    // 5. Sincronización periódica de estados
    await this.syncJunoStatuses();
    await this.logPaymentEvent(payment.id, 'lifecycle_end', 'Ciclo completo de pago terminado.');
  }
}

// Nota: Implementar los detalles de cada método integrando los servicios reales de Juno, contrato y DB.
// Cada método debe registrar eventos en PaymentEvent para trazabilidad.
