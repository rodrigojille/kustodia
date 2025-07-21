// Sync Payment Status from Local to Production
// Migrates status of payments 112 and 113 from local DB to production DB

const { Client } = require('pg');
require('dotenv').config();

async function syncLocalToProduction() {
  console.log('🔄 LOCAL TO PRODUCTION SYNC');
  console.log('=' .repeat(60));
  
  // Local database connection
  const localClient = new Client({
    connectionString: process.env.DATABASE_URL, // Local DB
    ssl: false
  });

  // Production database connection
  const prodClient = new Client({
    connectionString: process.env.DATABASE_URL_PROD || process.env.DATABASE_URL, // Prod DB
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Connect to both databases
    await localClient.connect();
    console.log('✅ Local database connected');
    
    await prodClient.connect();
    console.log('✅ Production database connected');

    // 1. Get current status from local database
    console.log('\n📋 LOCAL DATABASE STATUS:');
    
    const localQuery = `
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
      WHERE p.id IN (112, 113)
      ORDER BY p.id;
    `;
    
    const localResult = await localClient.query(localQuery);
    
    console.log(`Found ${localResult.rows.length} payments in local database:`);
    localResult.rows.forEach(payment => {
      console.log(`\n💰 Local Payment ${payment.id}:`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Type: ${payment.payment_type || 'traditional'}`);
      console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
      console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
      console.log(`   Escrow Status: ${payment.escrow_status || 'None'}`);
      console.log(`   Release TX: ${payment.release_tx_hash ? '✅ ' + payment.release_tx_hash.substring(0, 10) + '...' : '❌ None'}`);
    });

    // 2. Get current status from production database
    console.log('\n📋 PRODUCTION DATABASE STATUS:');
    
    const prodResult = await prodClient.query(localQuery); // Same query
    
    console.log(`Found ${prodResult.rows.length} payments in production database:`);
    prodResult.rows.forEach(payment => {
      console.log(`\n💰 Prod Payment ${payment.id}:`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: $${payment.amount}`);
      console.log(`   Type: ${payment.payment_type || 'traditional'}`);
      console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
      console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
      console.log(`   Escrow Status: ${payment.escrow_status || 'None'}`);
      console.log(`   Release TX: ${payment.release_tx_hash ? '✅ ' + payment.release_tx_hash.substring(0, 10) + '...' : '❌ None'}`);
    });

    // 3. Compare and identify differences
    console.log('\n🔍 COMPARING LOCAL VS PRODUCTION:');
    
    const migrations = [];
    
    for (const localPayment of localResult.rows) {
      const prodPayment = prodResult.rows.find(p => p.id === localPayment.id);
      
      if (!prodPayment) {
        console.log(`⚠️  Payment ${localPayment.id}: Exists in local but NOT in production`);
        continue;
      }
      
      const statusDifferent = localPayment.status !== prodPayment.status;
      const approvalsDifferent = 
        localPayment.payer_approval !== prodPayment.payer_approval ||
        localPayment.payee_approval !== prodPayment.payee_approval;
      const escrowDifferent = 
        localPayment.escrow_status !== prodPayment.escrow_status ||
        localPayment.release_tx_hash !== prodPayment.release_tx_hash;
      
      console.log(`\n📊 Payment ${localPayment.id} Comparison:`);
      console.log(`   Status: Local '${localPayment.status}' vs Prod '${prodPayment.status}' ${statusDifferent ? '⚠️  DIFFERENT' : '✅ SAME'}`);
      console.log(`   Payer Approval: Local ${localPayment.payer_approval} vs Prod ${prodPayment.payer_approval} ${localPayment.payer_approval !== prodPayment.payer_approval ? '⚠️  DIFFERENT' : '✅ SAME'}`);
      console.log(`   Payee Approval: Local ${localPayment.payee_approval} vs Prod ${prodPayment.payee_approval} ${localPayment.payee_approval !== prodPayment.payee_approval ? '⚠️  DIFFERENT' : '✅ SAME'}`);
      console.log(`   Escrow Status: Local '${localPayment.escrow_status}' vs Prod '${prodPayment.escrow_status}' ${localPayment.escrow_status !== prodPayment.escrow_status ? '⚠️  DIFFERENT' : '✅ SAME'}`);
      console.log(`   Release TX: ${localPayment.release_tx_hash !== prodPayment.release_tx_hash ? '⚠️  DIFFERENT' : '✅ SAME'}`);
      
      if (statusDifferent || approvalsDifferent || escrowDifferent) {
        migrations.push({
          paymentId: localPayment.id,
          local: localPayment,
          prod: prodPayment,
          needsStatusUpdate: statusDifferent,
          needsApprovalUpdate: approvalsDifferent,
          needsEscrowUpdate: escrowDifferent
        });
      }
    }

    // 4. Execute migrations if needed
    if (migrations.length === 0) {
      console.log('\n✅ No migrations needed - local and production are in sync');
      return;
    }

    console.log(`\n⚠️  MIGRATION PLAN (${migrations.length} payments need updates):`);
    
    const EXECUTE_MIGRATION = false; // Set to true to actually execute
    
    for (const migration of migrations) {
      console.log(`\n🎯 Payment ${migration.paymentId} Migration Plan:`);
      
      if (migration.needsStatusUpdate) {
        console.log(`   📝 Update status: '${migration.prod.status}' → '${migration.local.status}'`);
      }
      
      if (migration.needsApprovalUpdate) {
        console.log(`   📝 Update approvals: Payer ${migration.prod.payer_approval} → ${migration.local.payer_approval}, Payee ${migration.prod.payee_approval} → ${migration.local.payee_approval}`);
      }
      
      if (migration.needsEscrowUpdate) {
        console.log(`   📝 Update escrow: Status '${migration.prod.escrow_status}' → '${migration.local.escrow_status}'`);
        if (migration.local.release_tx_hash !== migration.prod.release_tx_hash) {
          console.log(`   📝 Update release TX: '${migration.prod.release_tx_hash || 'None'}' → '${migration.local.release_tx_hash || 'None'}'`);
        }
      }
    }

    if (EXECUTE_MIGRATION) {
      console.log('\n⚡ EXECUTING MIGRATIONS:');
      
      for (const migration of migrations) {
        try {
          await prodClient.query('BEGIN');
          
          // Update payment
          if (migration.needsStatusUpdate || migration.needsApprovalUpdate) {
            await prodClient.query(`
              UPDATE payment 
              SET status = $1, payer_approval = $2, payee_approval = $3, updated_at = NOW()
              WHERE id = $4
            `, [
              migration.local.status,
              migration.local.payer_approval,
              migration.local.payee_approval,
              migration.paymentId
            ]);
            console.log(`   ✅ Payment ${migration.paymentId}: Status and approvals updated`);
          }
          
          // Update escrow
          if (migration.needsEscrowUpdate) {
            await prodClient.query(`
              UPDATE escrow 
              SET status = $1, release_tx_hash = $2, updated_at = NOW()
              WHERE payment_id = $3
            `, [
              migration.local.escrow_status,
              migration.local.release_tx_hash,
              migration.paymentId
            ]);
            console.log(`   ✅ Payment ${migration.paymentId}: Escrow updated`);
          }
          
          // Add migration event
          await prodClient.query(`
            INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
            VALUES ($1, $2, $3, $4, NOW())
          `, [
            migration.paymentId,
            'sync_from_local',
            'Estado sincronizado desde base de datos local - migración de desarrollo a producción',
            true
          ]);
          
          await prodClient.query('COMMIT');
          console.log(`   ✅ Payment ${migration.paymentId}: Migration completed`);
          
        } catch (error) {
          await prodClient.query('ROLLBACK');
          console.log(`   ❌ Payment ${migration.paymentId}: Migration failed - ${error.message}`);
        }
      }
      
      console.log('\n🎉 SYNC COMPLETED!');
    } else {
      console.log('\n🧪 DRY RUN - No changes made to production');
      console.log('   To execute sync, set EXECUTE_MIGRATION = true in the script');
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    if (localClient) await localClient.end();
    if (prodClient) await prodClient.end();
    console.log('\n🔌 Database connections closed');
  }
}

// Run the sync
syncLocalToProduction().catch(console.error);
