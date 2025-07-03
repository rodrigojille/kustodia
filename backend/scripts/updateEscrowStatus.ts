import { DataSource } from 'typeorm';
import { Escrow } from '../src/entity/Escrow';
import ormconfig from '../src/ormconfig';

const updateEscrowStatus = async (escrowId: number, newStatus: 'active' | 'released' | 'completed' | 'dispute') => {
  let dataSource: DataSource | null = null;
  try {
    console.log('🔌 Connecting to the database...');
    dataSource = await ormconfig.initialize();
    console.log('✅ Database connected.');

    const escrowRepo = dataSource.getRepository(Escrow);

    console.log(`🔍 Finding escrow with ID: ${escrowId}`);
    const escrow = await escrowRepo.findOne({ where: { id: escrowId } });

    if (!escrow) {
      console.error(`❌ Escrow with ID ${escrowId} not found.`);
      return;
    }

    console.log(`Status of escrow ${escrowId} is currently: '${escrow.status}'`);
    console.log(`Updating status to: '${newStatus}'...`);

    escrow.status = newStatus;
    await escrowRepo.save(escrow);

    console.log(`✅ Escrow ${escrowId} status successfully updated to '${newStatus}'.`);

  } catch (error) {
    console.error('❌ Error updating escrow status:', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed.');
    }
  }
};

const escrowIdArg = process.argv[2];
const newStatusArg = process.argv[3];

if (!escrowIdArg || !newStatusArg) {
  console.error('Usage: ts-node backend/scripts/updateEscrowStatus.ts <escrowId> <newStatus>');
  console.error("Example: ts-node backend/scripts/updateEscrowStatus.ts 72 released");
  process.exit(1);
}

const validStatuses = ['active', 'released', 'completed', 'dispute'];
if (!validStatuses.includes(newStatusArg)) {
    console.error(`Invalid status '${newStatusArg}'. Must be one of: ${validStatuses.join(', ')}`);
    process.exit(1);
}

updateEscrowStatus(parseInt(escrowIdArg, 10), newStatusArg as any);
