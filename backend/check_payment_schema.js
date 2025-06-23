require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkPaymentSchema() {
  console.log('📋 CHECKING PAYMENT TABLE SCHEMA');
  console.log('================================');
  
  try {
    await client.connect();
    
    // Check payment table columns
    const paymentSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payment'
      ORDER BY ordinal_position;
    `);
    
    console.log('Payment table columns:');
    paymentSchema.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });
    
    console.log('');
    
    // Get current Payment 81 data
    console.log('📊 CURRENT PAYMENT 81 DATA:');
    const payment81 = await client.query(`
      SELECT * FROM payment WHERE id = 81
    `);
    
    if (payment81.rows.length > 0) {
      const payment = payment81.rows[0];
      console.log('Current values:');
      Object.keys(payment).forEach(key => {
        console.log(`${key}: ${payment[key]}`);
      });
    }
    
    console.log('');
    
    // Check escrow data
    console.log('📊 CURRENT ESCROW DATA:');
    const escrow81 = await client.query(`
      SELECT * FROM escrow WHERE payment_id = 81
    `);
    
    if (escrow81.rows.length > 0) {
      const escrow = escrow81.rows[0];
      console.log('Current escrow values:');
      Object.keys(escrow).forEach(key => {
        console.log(`${key}: ${escrow[key]}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await client.end();
  }
}

checkPaymentSchema();
