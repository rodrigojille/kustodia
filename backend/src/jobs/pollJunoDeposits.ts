import { createConnection, getRepository } from 'typeorm';
import { PaymentService } from '../services/paymentService';
import { listJunoTransactions } from '../services/junoService';
import { Payment } from '../entity/Payment';

// Polling interval in milliseconds (configurable via env)
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '60000', 10); // default: 60s

async function pollDeposits() {
  const paymentService = new PaymentService();
  const paymentRepo = getRepository(Payment);

  // 1. Obtener transacciones recientes de Juno (SPEI)
  const transactions = await listJunoTransactions();

  for (const tx of transactions) {
    if (tx.type !== 'deposit' || tx.status !== 'completed') continue;

    // 2. Buscar Payment pendiente por CLABE y monto
    const payment = await paymentRepo.findOne({
      where: {
        payout_clabe: tx.clabe,
        amount: tx.amount,
        status: 'pending',
      },
    });

    if (payment) {
      // Claim atómico: cambia a 'processing' solo si sigue 'pending'
      const result = await paymentRepo.createQueryBuilder()
        .update()
        .set({ status: 'processing' })
        .where('id = :id AND status = :status', { id: payment.id, status: 'pending' })
        .execute();
      if (result.affected !== 1) {
        // Otro poller ya lo está procesando
        continue;
      }
      // Log event: processing
      await paymentService.logPaymentEvent(payment.id, 'processing', 'Pago en procesamiento tras detectar depósito SPEI.');
      try {
        await paymentService.processFullPaymentLifecycle(payment.id);
        console.log(`[Polling] Payment ${payment.id} processed.`);
      } catch (err) {
        // Regresa a 'pending' para reintentos y loguea error
        await paymentRepo.update(payment.id, { status: 'pending' });
        await paymentService.logPaymentEvent(payment.id, 'processing_error', `Error en procesamiento: ${err instanceof Error ? err.message : err}`);
        console.error(`[Polling] Error processing payment ${payment.id}:`, err);
      }
    }
  }
}

async function startPolling() {
  await createConnection(); // Asegura conexión a la BD
  while (true) {
    try {
      await pollDeposits();
    } catch (err) {
      console.error('[Polling] Error in pollDeposits:', err);
    }
    await new Promise((res) => setTimeout(res, POLL_INTERVAL));
  }
}

startPolling();
