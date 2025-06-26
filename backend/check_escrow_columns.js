const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkEscrowColumns() {
  const client = await pool.connect();
  try {
    const columnsQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = 'escrow' ORDER BY ordinal_position`;
    const result = await client.query(columnsQuery);
    console.log('escrow table columns:');
    result.rows.forEach(row => console.log(' -', row.column_name));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}
checkEscrowColumns();
