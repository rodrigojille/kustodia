// Direct SQL Payment Migration Script
// Uses direct database queries to avoid TypeORM complications

const { Client } = require('pg');
require('dotenv').config();

async function runPaymentMigration() {
  console.log('🚀 DIRECT PAYMENT MIGRATION');
  console.log('=' .repeat(60));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Database connected');

    // 1. Check current status of payments 112 and 113
    console.log('\n📋 CURRENT STATUS CHECK:');
    
    const statusQuery = `
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.payment_type,
        p.payer_approval,
        p.payee_approval,
        p.updated_at,
        e.status as escrow_status,
        e.release_tx_hash,
        e.smart_contract_escrow_id
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.id IN (112, 113, 114, 115)
      ORDER BY p.id;
    `;
    
    const statusResult = await client.query(statusQuery);
    
    statusResult.rows.forEach(payment => {
      console.log(`\n💰 Payment ${payment.id}:`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Type: ${payment.payment_type || 'traditional'}`);
      console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
      console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
      console.log(`   Escrow Status: ${payment.escrow_status || 'None'}`);
      console.log(`   Release TX: ${payment.release_tx_hash ? '✅ ' + payment.release_tx_hash.substring(0, 10) + '...' : '❌ None'}`);
      console.log(`   Smart Contract: ${payment.smart_contract_escrow_id || 'None'}`);
      
      // Check if migration needed
      const needsMigration = payment.release_tx_hash && payment.status !== 'completed';
      console.log(`   Migration Needed: ${needsMigration ? '⚠️  YES' : '✅ NO'}`);
    });

    // 2. Find all payments that need migration
    console.log('\n🔍 FINDING PAYMENTS NEEDING MIGRATION:');
    
    const migrationQuery = `
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.payment_type,
        e.release_tx_hash
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE e.release_tx_hash IS NOT NULL 
        AND p.status != 'completed'
      ORDER BY p.id;
    `;
    
    const migrationResult = await client.query(migrationQuery);
    
    console.log(`Found ${migrationResult.rows.length} payments needing migration:`);
    migrationResult.rows.forEach(payment => {
      console.log(`   Payment ${payment.id}: Status '${payment.status}' → Should be 'completed'`);
    });

    // 3. Ask for confirmation before proceeding
    if (migrationResult.rows.length > 0) {
      console.log('\n⚠️  MIGRATION PLAN:');
      console.log('   The following actions will be performed:');
      console.log('   1. Update payment status to "completed"');
      console.log('   2. Add migration event to payment history');
      console.log('   3. Update payment updated_at timestamp');
      
      // For now, just show what would be done (DRY RUN)
      console.log('\n🧪 DRY RUN - No changes will be made');
      console.log('   To execute migrations, modify the script to set EXECUTE_MIGRATION = true');
      
      const EXECUTE_MIGRATION = false; // Set to true to actually execute
      
      if (EXECUTE_MIGRATION) {
        console.log('\n⚡ EXECUTING MIGRATIONS:');
        
        for (const payment of migrationResult.rows) {
          try {
            // Begin transaction
            await client.query('BEGIN');
            
            // Update payment status
            await client.query(
              'UPDATE payment SET status = $1, updated_at = NOW() WHERE id = $2',
              ['completed', payment.id]
            );
            
            // Add migration event
            await client.query(`
              INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
              VALUES ($1, $2, $3, $4, NOW())
            `, [
              payment.id,
              'status_corrected',
              'Estado corregido automáticamente - pago completado tras liberación de custodia',
              true
            ]);
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log(`   ✅ Payment ${payment.id}: Status updated to completed`);
            
          } catch (error) {
            // Rollback on error
            await client.query('ROLLBACK');
            console.log(`   ❌ Payment ${payment.id}: Error - ${error.message}`);
          }
        }
        
        console.log('\n✅ Migration execution completed');
      }
    } else {
      console.log('\n✅ No migrations needed - all payments are in correct status');
    }

    // 4. Show final statistics
    console.log('\n📊 FINAL STATISTICS:');
    
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM payment
      GROUP BY status
      ORDER BY count DESC;
    `;
    
    const statsResult = await client.query(statsQuery);
    
    console.log('   Payment Status Distribution:');
    statsResult.rows.forEach(stat => {
      console.log(`     ${stat.status}: ${stat.count} payments`);
    });

    const totalQuery = 'SELECT COUNT(*) as total FROM payment';
    const totalResult = await client.query(totalQuery);
    console.log(`   Total Payments: ${totalResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
runPaymentMigration().catch(console.error);
