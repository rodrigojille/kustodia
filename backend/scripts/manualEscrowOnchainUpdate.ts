import ormconfig from '../src/ormconfig';
import { Escrow } from '../src/entity/Escrow';

// Manual update for escrow 56/payment 61 with on-chain tx hash
async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);

  // Update escrow 56
  const escrow = await escrowRepo.findOne({ where: { id: 56 } });
  if (!escrow) {
    console.error('Escrow 56 not found');
    process.exit(1);
  }

  escrow.blockchain_tx_hash = '0xd1bb4770e09e5d7e211b67a3c256f4d7956a30aa46bd752fe42d7c0a1c53da48';
  // Optionally set status
  // escrow.status = 'onchain_locked';

  await escrowRepo.save(escrow);
  console.log('Escrow 56 updated with on-chain tx hash.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
