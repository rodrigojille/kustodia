import ormconfig from '../ormconfig';
import { releaseEscrowAndPayout } from '../services/payoutService';

async function main() {
  const escrowId = Number(process.argv[2]);
  if (!escrowId) {
    console.error('Usage: ts-node manualPayout.ts <escrowId>');
    process.exit(1);
  }
  await ormconfig.initialize();
  try {
    const result = await releaseEscrowAndPayout(escrowId);
    console.log('Payout result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error executing payout:', err);
    process.exit(1);
  }
}

main();
