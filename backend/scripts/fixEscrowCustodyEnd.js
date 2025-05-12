// Script to update all test escrows' custody_end to 24 hours from now
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createConnection } = require('typeorm');
const path = require('path');

(async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'kustodia',
      entities: [
        path.join(__dirname, '../src/entity/*.ts'),
        path.join(__dirname, '../src/entity/*.js')
      ],
      synchronize: false,
      logging: false,
    });
    const escrowRepo = connection.getRepository('Escrow');
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
    const escrows = await escrowRepo.find();
    for (const escrow of escrows) {
      escrow.custody_end = future;
      await escrowRepo.save(escrow);
      console.log(`Escrow ${escrow.id} custody_end updated to ${future.toISOString()}`);
    }
    await connection.close();
    console.log('All escrows updated successfully.');
  } catch (err) {
    console.error('Error updating escrows:', err);
    process.exit(1);
  }
})();
