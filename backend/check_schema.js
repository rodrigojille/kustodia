require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkSchema() {
  await client.connect();
  
  console.log('📋 Checking payment_event table schema...');
  const schema = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'payment_event'
    ORDER BY ordinal_position;
  `);
  
  console.log('Columns in payment_event:');
  schema.rows.forEach(row => {
    console.log(`- ${row.column_name}: ${row.data_type}`);
  });
  
  await client.end();
}

checkSchema();
