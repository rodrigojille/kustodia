import ormconfig from '../ormconfig';
import { redeemMXNBToMXNAndPayout } from '../services/payoutService';

async function main() {
  const escrowId = Number(process.argv[2]);
  const amount = Number(process.argv[3]);
  if (!escrowId || !amount) {
    console.error('Usage: ts-node testRedemption.ts <escrowId> <amountMXNB>');
    process.exit(1);
  }
  await ormconfig.initialize();
  try {
    const result = await redeemMXNBToMXNAndPayout(escrowId, amount);
    console.log('Redemption result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error executing redemption:', err);
    process.exit(1);
  }
}

main();
