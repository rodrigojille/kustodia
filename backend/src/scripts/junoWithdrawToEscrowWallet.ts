console.log('--- Script execution started ---');
import dotenv from 'dotenv';
import path from 'path';
import { withdrawCryptoToBridgeWallet } from '../services/junoService';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const destinationAddress = process.env.BRIDGE_WALLET_ADDRESS!;
  const amount = parseFloat(process.env.WITHDRAW_AMOUNT || '2000');

  if (!destinationAddress) {
    throw new Error('Falta BRIDGE_WALLET_ADDRESS en .env');
  }

  console.log(`Iniciando withdrawal de ${amount} MXNB to ${destinationAddress}`);
  await withdrawCryptoToBridgeWallet(amount, destinationAddress);
}

(async () => {
  try {
    await main();
    console.log('\nScript finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('\n--- SCRIPT FAILED ---');
    console.error('An error was caught by the execution wrapper:', error);
    process.exit(1);
  }
})();
