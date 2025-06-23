import dotenv from 'dotenv';
import { listJunoTransactions } from '../services/junoService';
import { DataSource } from 'typeorm';
import { Payment } from '../entity/Payment';
import { JunoTransaction } from '../entity/JunoTransaction';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { Dispute } from '../entity/Dispute';
import { User } from '../entity/User';
import { Lead } from '../entity/Lead';
import EarlyAccessCounter from '../entity/EarlyAccessCounter';
import axios from 'axios';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: '../../.env' });

console.log('=== Environment Variables Check ===');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***MASKED***' : 'UNDEFINED');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

// Create local DataSource with loaded environment variables
const localDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Payment, JunoTransaction, Escrow, PaymentEvent, Dispute, User, Lead, EarlyAccessCounter],
  synchronize: false,
  logging: false,
});

// Function to get SPEI deposits with CLABEs
async function getSpeiDeposits() {
  const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
  const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
  const baseURL = 'https://stage.buildwithjuno.com';
  const requestPath = '/spei/v1/deposits';
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';
  
  const stringToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET!).update(stringToSign).digest('hex');
  
  try {
    const response = await axios.get(baseURL + requestPath, {
      headers: {
        'X-API-KEY': JUNO_API_KEY,
        'X-SIGNATURE': signature,
        'X-NONCE': nonce,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.payload || [];
  } catch (error) {
    console.error('Error fetching SPEI deposits:', error);
    return [];
  }
}

// Function to correlate SPEI deposits with ISSUANCE transactions
function correlateSpeisWithIssuances(speiDeposits: any[], issuanceTransactions: any[]) {
  const correlatedTransactions = new Map();
  
  for (const spei of speiDeposits) {
    // Find matching ISSUANCE by amount and approximate timing
    const matchingIssuance = issuanceTransactions.find(issuance => {
      const amountMatch = Number(issuance.amount) === Number(spei.amount);
      const speiTime = new Date(spei.created_at);
      const issuanceTime = new Date(issuance.created_at);
      const timeDiff = Math.abs(issuanceTime.getTime() - speiTime.getTime());
      const withinTimeWindow = timeDiff < 24 * 60 * 60 * 1000; // 24 hours
      
      return amountMatch && withinTimeWindow;
    });
    
    if (matchingIssuance) {
      correlatedTransactions.set(matchingIssuance.id, {
        issuance: matchingIssuance,
        spei: spei,
        clabe: spei.receiver_clabe
      });
      
      console.log(`[CORRELATION] ISSUANCE ${matchingIssuance.id} ↔ SPEI ${spei.id} (CLABE: ${spei.receiver_clabe})`);
    }
  }
  
  return correlatedTransactions;
}

async function main() {
  await localDataSource.initialize();
  const paymentRepo = localDataSource.getRepository(Payment);
  const junoTxRepo = localDataSource.getRepository(JunoTransaction);

  // 1. Obtener todas las transacciones de Juno
  const junoTxs = await listJunoTransactions(true); // true = stage

  let updatedPayments = 0;
  let updatedJunoTxs = 0;

  // Fetch SPEI deposits
  const speiDeposits = await getSpeiDeposits();

  // Correlate SPEI deposits with ISSUANCE transactions
  const correlatedTransactions = correlateSpeisWithIssuances(speiDeposits, junoTxs.filter((tx: any) => tx.transaction_type === 'ISSUANCE'));

  for (const junoTx of junoTxs) {
    // Ajusta los nombres de campos según el payload real de Juno
    const { id: junoId, amount, beneficiary_clabe, clabe, transaction_type } = junoTx;

    let payment: Payment | null = null;

    if (transaction_type === 'REDEMPTION') {
      // Match para retiros (redemptions)
      payment = await paymentRepo.findOne({
        where: {
          amount: Number(amount),
          payout_clabe: beneficiary_clabe,
        }
      });
    } else if (transaction_type === 'ISSUANCE') {
      // Match para depósitos (issuances) - buscar por amount y deposit_clabe
      const correlatedTx = correlatedTransactions.get(junoTx.id);
      if (correlatedTx) {
        payment = await paymentRepo.findOne({
          where: {
            amount: Number(amount),
            deposit_clabe: correlatedTx.clabe,
          }
        });
      } else {
        payment = await paymentRepo.findOne({
          where: {
            amount: Number(amount),
            deposit_clabe: clabe,
          }
        });
      }
      
      console.log(`[DEBUG] Looking for ISSUANCE match: amount=${amount}, clabe=${clabe}`);
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
      console.warn(`[WARN] No se encontró match local para transacción Juno ${junoId} (monto: ${amount}, clabe: ${beneficiary_clabe || clabe}, tipo: ${transaction_type})`);
    }
  }

  console.log(`Pagos actualizados: ${updatedPayments}`);
  console.log(`JunoTransactions actualizados: ${updatedJunoTxs}`);
  
  await localDataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error sincronizando references:', err);
  process.exit(1);
});
