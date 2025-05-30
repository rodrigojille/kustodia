import ormconfig from '../ormconfig';
import { Payment } from '../entity/Payment';
import { JunoTransaction } from '../entity/JunoTransaction';
import { listJunoTransactions } from '../services/junoService';

async function main() {
  await ormconfig.initialize();
  const paymentRepo = ormconfig.getRepository(Payment);
  const junoTxRepo = ormconfig.getRepository(JunoTransaction);

  // 1. Obtener todas las transacciones de Juno
  const junoTxs = await listJunoTransactions(true); // true = stage

  let updatedPayments = 0;
  let updatedJunoTxs = 0;

  for (const junoTx of junoTxs) {
    // Ajusta los nombres de campos según el payload real de Juno
    const { id: junoId, amount, beneficiary_clabe, clabe, type } = junoTx;

    let payment: Payment | null = null;

    if (type === 'payout') {
      // Match para retiros
      payment = await paymentRepo.findOne({
        where: {
          amount: Number(amount),
          payout_clabe: beneficiary_clabe,
        }
      });
    } else if (type === 'deposit') {
      // Match para depósitos
      payment = await paymentRepo.findOne({
        where: {
          amount: Number(amount),
          deposit_clabe: clabe,
        }
      });
    }

    // Buscar el JunoTransaction local por amount y (idealmente) reference
    let junoTransaction = await junoTxRepo.findOne({
      where: [
        { amount: Number(amount), reference: junoId },
        { amount: Number(amount), reference: null }
      ]
    });

    // Actualizar references y transaction_id si hay match
    if (payment) {
      let changed = false;
      if (payment.reference !== junoId) {
        payment.reference = junoId;
        changed = true;
      }
      if (payment.transaction_id !== junoId) {
        payment.transaction_id = junoId;
        changed = true;
      }
      if (changed) {
        await paymentRepo.save(payment);
        updatedPayments++;
        console.log(`[OK] Payment actualizado: id=${payment.id}, reference=${junoId}`);
      }
    }

    if (junoTransaction && junoTransaction.reference !== junoId) {
      junoTransaction.reference = junoId;
      await junoTxRepo.save(junoTransaction);
      updatedJunoTxs++;
      console.log(`[OK] JunoTransaction actualizado: id=${junoTransaction.id}, reference=${junoId}`);
    }

    // Si no hay match, lo reportamos para revisión manual
    if (!payment && !junoTransaction) {
      console.warn(`[WARN] No se encontró match local para transacción Juno ${junoId} (monto: ${amount}, clabe: ${beneficiary_clabe || clabe}, tipo: ${type})`);
    }
  }

  console.log(`Pagos actualizados: ${updatedPayments}`);
  console.log(`JunoTransactions actualizados: ${updatedJunoTxs}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error sincronizando references:', err);
  process.exit(1);
});
