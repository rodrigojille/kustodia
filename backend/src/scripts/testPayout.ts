import { releaseEscrowAndPayout } from '../services/payoutService';
import ormconfig from '../ormconfig';

async function main() {
  const escrowId = Number(process.argv[2]);
  if (!escrowId) {
    console.error('Usage: ts-node src/scripts/testPayout.ts <escrowId>');
    process.exit(1);
  }
  try {
    await ormconfig.initialize();
    const result = await releaseEscrowAndPayout(escrowId);
    console.log('Payout result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Payout failed:', err);
    process.exit(1);
  }
}

main();
