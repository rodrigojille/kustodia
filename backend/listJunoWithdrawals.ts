import dotenv from 'dotenv';
dotenv.config();
import { listJunoTransactions } from './src/services/junoService';

async function main() {
  const txs = await listJunoTransactions(true);
  console.log('Últimos withdrawals de Juno:');
  txs.filter((tx: any) => tx.type === 'withdrawal').forEach((tx: any) => {
    console.log(`UUID: ${tx.uuid} | Monto: ${tx.amount} | Estado: ${tx.status} | Referencia: ${tx.reference} | Fecha: ${tx.created_at}`);
  });
}

main().catch(console.error);
