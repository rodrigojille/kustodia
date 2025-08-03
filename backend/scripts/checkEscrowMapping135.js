const { Pool } = require('pg');
require('dotenv').config();

async function checkEscrowMapping() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    console.log('🔍 CHECKING ESCROW MAPPING FOR PAYMENT 135');
    console.log('============================================');

    // 1. Check payment and escrow relationship
    const query = `
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        p.escrow_id,
        p.payer_approval,
        p.payee_approval,
        e.id as escrow_db_id,
        e.smart_contract_escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        e.release_amount
      FROM payments p
      LEFT JOIN escrows e ON p.escrow_id = e.id
      WHERE p.id = 135
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ Payment 135 not found');
      return;
    }

    const data = result.rows[0];
    console.log('\n📊 PAYMENT-ESCROW MAPPING:');
    console.log('Payment ID:', data.payment_id);
    console.log('Payment Status:', data.payment_status);
    console.log('Payment Escrow ID (FK):', data.escrow_id);
    console.log('Payer Approved:', data.payer_approval);
    console.log('Payee Approved:', data.payee_approval);
    console.log('');
    console.log('Escrow DB ID:', data.escrow_db_id);
    console.log('Smart Contract Escrow ID:', data.smart_contract_escrow_id);
    console.log('Escrow Status:', data.escrow_status);
    console.log('Custody Amount:', data.custody_amount);
    console.log('Release Amount:', data.release_amount);

    // 2. Check recent payment events to see what escrow ID is being used in errors
    const eventsQuery = `
      SELECT type, description, created_at
      FROM payment_events
      WHERE payment_id = 135
      AND description LIKE '%escrow%'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const eventsResult = await pool.query(eventsQuery);
    
    console.log('\n📝 RECENT ESCROW-RELATED EVENTS:');
    eventsResult.rows.forEach(event => {
      console.log(`${event.created_at}: ${event.description}`);
    });

    // 3. Check if there's an escrow 110 that might be causing confusion
    const escrow110Query = `
      SELECT id, smart_contract_escrow_id, status, custody_amount
      FROM escrows
      WHERE id = 110
    `;
    
    const escrow110Result = await pool.query(escrow110Query);
    
    if (escrow110Result.rows.length > 0) {
      console.log('\n⚠️  ESCROW 110 EXISTS:');
      const escrow110 = escrow110Result.rows[0];
      console.log('DB ID:', escrow110.id);
      console.log('Smart Contract ID:', escrow110.smart_contract_escrow_id);
      console.log('Status:', escrow110.status);
      console.log('Amount:', escrow110.custody_amount);
    } else {
      console.log('\n❌ ESCROW 110 DOES NOT EXIST');
    }

    // 4. Summary and recommendations
    console.log('\n🎯 ANALYSIS:');
    if (data.escrow_id === 100 && data.smart_contract_escrow_id === '12') {
      console.log('✅ Correct mapping: Payment 135 → Escrow 100 → Smart Contract 12');
      console.log('❌ System error: Trying to release escrow 110 instead of 100');
      console.log('');
      console.log('🔧 SOLUTION: Fix the automation service to use the correct escrow ID');
    } else {
      console.log('❌ Mapping issue detected');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEscrowMapping();
