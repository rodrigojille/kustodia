// Focused Migration for Payment 81
// Safely migrates Payment 81 from 'cancelled' to 'completed' status

const { Client } = require('pg');
require('dotenv').config();

async function migratePayment81() {
  console.log('🎯 PAYMENT 81 MIGRATION');
  console.log('=' .repeat(50));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Database connected');

    // 1. Detailed analysis of Payment 81
    console.log('\n🔍 PAYMENT 81 DETAILED ANALYSIS:');
    
    const detailQuery = `
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.payment_type,
        p.payer_approval,
        p.payee_approval,
        p.created_at,
        p.updated_at,
        e.status as escrow_status,
        e.release_tx_hash,
        e.smart_contract_escrow_id,
        e.created_at as escrow_created,
        e.updated_at as escrow_updated
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.id = 81;
    `;
    
    const detailResult = await client.query(detailQuery);
    
    if (detailResult.rows.length === 0) {
      console.log('❌ Payment 81 not found');
      return;
    }
    
    const payment = detailResult.rows[0];
    
    console.log(`   Payment ID: ${payment.id}`);
    console.log(`   Current Status: ${payment.status}`);
    console.log(`   Amount: $${payment.amount}`);
    console.log(`   Type: ${payment.payment_type || 'traditional'}`);
    console.log(`   Payer Approval: ${payment.payer_approval ? 'YES' : 'NO'}`);
    console.log(`   Payee Approval: ${payment.payee_approval ? 'YES' : 'NO'}`);
    console.log(`   Created: ${payment.created_at}`);
    console.log(`   Last Updated: ${payment.updated_at}`);
    console.log(`   Escrow Status: ${payment.escrow_status}`);
    console.log(`   Release TX: ${payment.release_tx_hash || 'None'}`);
    console.log(`   Smart Contract ID: ${payment.smart_contract_escrow_id || 'None'}`);
    console.log(`   Escrow Created: ${payment.escrow_created || 'None'}`);
    console.log(`   Escrow Updated: ${payment.escrow_updated || 'None'}`);

    // 2. Check recent events for context
    console.log('\n📋 RECENT PAYMENT EVENTS:');
    
    const eventsQuery = `
      SELECT type, description, is_automatic, created_at
      FROM payment_event
      WHERE payment_id = 81
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    
    const eventsResult = await client.query(eventsQuery);
    
    if (eventsResult.rows.length > 0) {
      eventsResult.rows.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        const auto = event.is_automatic ? '[AUTO]' : '[MANUAL]';
        console.log(`   ${date} ${auto} ${event.type}: ${event.description || 'No description'}`);
      });
    } else {
      console.log('   No events found');
    }

    // 3. Validate migration conditions
    console.log('\n✅ MIGRATION VALIDATION:');
    
    const hasReleaseTx = payment.release_tx_hash !== null;
    const isCurrentlyCancelled = payment.status === 'cancelled';
    const shouldMigrate = hasReleaseTx && isCurrentlyCancelled;
    
    console.log(`   Has Release TX: ${hasReleaseTx ? '✅ YES' : '❌ NO'}`);
    console.log(`   Currently Cancelled: ${isCurrentlyCancelled ? '✅ YES' : '❌ NO'}`);
    console.log(`   Should Migrate: ${shouldMigrate ? '⚠️  YES' : '✅ NO'}`);
    
    if (!shouldMigrate) {
      console.log('\n✅ No migration needed');
      return;
    }

    // 4. Execute migration
    console.log('\n⚡ EXECUTING MIGRATION:');
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Update payment status
      const updateResult = await client.query(
        'UPDATE payment SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['completed', 81]
      );
      
      console.log(`   ✅ Payment status updated: cancelled → completed`);
      
      // Add migration event
      const eventResult = await client.query(`
        INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [
        81,
        'status_corrected',
        'Estado corregido automáticamente - pago marcado como completado tras verificar liberación de custodia exitosa',
        true
      ]);
      
      console.log(`   ✅ Migration event added`);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      
      // Show final status
      const finalResult = await client.query(
        'SELECT status, updated_at FROM payment WHERE id = 81'
      );
      
      const finalPayment = finalResult.rows[0];
      console.log(`   Final Status: ${finalPayment.status}`);
      console.log(`   Updated At: ${finalPayment.updated_at}`);
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.log(`   ❌ Migration failed: ${error.message}`);
      throw error;
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
migratePayment81().catch(console.error);
