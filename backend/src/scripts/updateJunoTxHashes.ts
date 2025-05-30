import ormconfig from '../ormconfig';
import { JunoTransaction } from '../entity/JunoTransaction';
import { getJunoTxHashFromTimeline } from '../services/junoService';
import { Not, IsNull } from 'typeorm';

async function main() {
  await ormconfig.initialize();
  const repo = ormconfig.getRepository(JunoTransaction);

  const txs = await repo.find({
    where: {
      type: 'deposit',
      status: 'complete',
      tx_hash: IsNull(),
      reference: Not(IsNull()),
    },
  });

  if (txs.length === 0) {
    console.log('No pending deposits found for hash update.');
    process.exit(0);
  }

  let updated = 0;
  for (const tx of txs) {
    const hash = await getJunoTxHashFromTimeline(tx.reference);
    if (!hash) {
      console.log(`No hash found for transaction ${tx.id} (reference: ${tx.reference})`);
      continue;
    }
    tx.tx_hash = hash;
    await repo.save(tx);
    console.log(`Updated transaction ${tx.id} with hash ${hash}`);
    updated++;
  }
  console.log(`Total updated: ${updated}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error updating hashes:', err);
  process.exit(1);
});
