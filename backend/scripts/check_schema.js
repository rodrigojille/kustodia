require('dotenv').config();
const { Client } = require('pg');

async function checkSchema() {
  const client = new Client(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    
    console.log('📋 Escrow table columns:');
    const escrowColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'escrow' 
      ORDER BY ordinal_position
    `);
    
    escrowColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n📋 Payment table columns:');
    const paymentColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      ORDER BY ordinal_position
    `);
    
    paymentColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Check the relationship between payment and escrow
    console.log('\n🔗 Checking Payment-Escrow relationship:');
    const relationshipCheck = await client.query(`
      SELECT p.id as payment_id, p.status, p.amount, e.id as escrow_id, e.custody_end
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.status = 'escrowed'
      ORDER BY p.id
    `);
    
    console.log(`Found ${relationshipCheck.rows.length} escrowed payments:`);
    relationshipCheck.rows.forEach(row => {
      console.log(`  Payment ${row.payment_id}: $${Number(row.amount).toLocaleString()} MXN, Escrow: ${row.escrow_id || 'NONE'}, End: ${row.custody_end || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema().catch(console.error);
