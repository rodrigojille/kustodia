// 🚀 HEROKU PRODUCTION MIGRATION FOR PAYMENTS 112 & 113
// This script runs directly on Heroku using the DATABASE_URL environment variable

const { Client } = require('pg');

// ✅ VERIFIED LOCAL DATA (from local database)
const PAYMENT_DATA = {
  112: {
    status: 'completed',
    payer_approval: true,
    payee_approval: true,
    escrow_status: 'completed',
    release_tx_hash: '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d',
    smart_contract_escrow_id: '9'
  },
  113: {
    status: 'completed',
    payer_approval: true,
    payee_approval: true,
    escrow_status: 'completed',
    release_tx_hash: '0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531',
    smart_contract_escrow_id: '10'
  }
};

async function migratePayments() {
  console.log('🚀 HEROKU PRODUCTION MIGRATION - PAYMENTS 112 & 113');
  console.log('=' .repeat(60));
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Production database connected');

    // 1. Check current status in production
    console.log('\n📋 CURRENT PRODUCTION STATUS:');
    
    const currentQuery = `
      SELECT 
        p.id,
        p.status,
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
    
    const currentResult = await client.query(currentQuery);
    
    if (currentResult.rows.length === 0) {
      console.log('❌ No payments 112 or 113 found in production database');
      return;
    }

    currentResult.rows.forEach(payment => {
      console.log(`\n💰 Production Payment ${payment.id}:`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
      console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
      console.log(`   Escrow Status: ${payment.escrow_status || 'None'}`);
      console.log(`   Release TX: ${payment.release_tx_hash ? payment.release_tx_hash.substring(0, 20) + '...' : 'None'}`);
      console.log(`   Smart Contract ID: ${payment.smart_contract_escrow_id || 'None'}`);
    });

    // 2. Show migration plan
    console.log('\n📝 MIGRATION PLAN:');
    
    const migrations = [];
    
    for (const [paymentId, localData] of Object.entries(PAYMENT_DATA)) {
      const prodPayment = currentResult.rows.find(p => p.id == paymentId);
      
      if (!prodPayment) {
        console.log(`⚠️  Payment ${paymentId}: Not found in production - SKIPPING`);
        continue;
      }
      
      const needsUpdate = 
        prodPayment.status !== localData.status ||
        prodPayment.payer_approval !== localData.payer_approval ||
        prodPayment.payee_approval !== localData.payee_approval ||
        prodPayment.escrow_status !== localData.escrow_status ||
        prodPayment.release_tx_hash !== localData.release_tx_hash ||
        prodPayment.smart_contract_escrow_id !== localData.smart_contract_escrow_id;
      
      console.log(`\n🎯 Payment ${paymentId} ${needsUpdate ? '⚠️  NEEDS UPDATE' : '✅ UP TO DATE'}:`);
      
      if (needsUpdate) {
        console.log(`   Status: '${prodPayment.status}' → '${localData.status}'`);
        console.log(`   Payer Approval: ${prodPayment.payer_approval} → ${localData.payer_approval}`);
        console.log(`   Payee Approval: ${prodPayment.payee_approval} → ${localData.payee_approval}`);
        console.log(`   Escrow Status: '${prodPayment.escrow_status}' → '${localData.escrow_status}'`);
        console.log(`   Release TX: ${prodPayment.release_tx_hash ? 'EXISTS' : 'None'} → ${localData.release_tx_hash.substring(0, 20)}...`);
        console.log(`   Smart Contract: '${prodPayment.smart_contract_escrow_id}' → '${localData.smart_contract_escrow_id}'`);
        
        migrations.push({ paymentId, localData, prodPayment });
      }
    }

    if (migrations.length === 0) {
      console.log('\n✅ No migrations needed - production is already up to date');
      return;
    }

    // 3. Execute migration
    console.log(`\n⚡ EXECUTING MIGRATION FOR ${migrations.length} PAYMENTS:`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const migration of migrations) {
      const { paymentId, localData } = migration;
      
      try {
        await client.query('BEGIN');
        
        // Update payment
        await client.query(`
          UPDATE payment 
          SET status = $1, payer_approval = $2, payee_approval = $3, updated_at = NOW()
          WHERE id = $4
        `, [localData.status, localData.payer_approval, localData.payee_approval, paymentId]);
        
        // Update escrow
        await client.query(`
          UPDATE escrow 
          SET status = $1, release_tx_hash = $2, smart_contract_escrow_id = $3, updated_at = NOW()
          WHERE payment_id = $4
        `, [localData.escrow_status, localData.release_tx_hash, localData.smart_contract_escrow_id, paymentId]);
        
        // Add migration event
        await client.query(`
          INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [
          paymentId,
          'production_migration',
          `Estado migrado desde desarrollo - Payment ${paymentId} completado con custodia liberada (TX: ${localData.release_tx_hash.substring(0, 20)}...)`,
          true
        ]);
        
        await client.query('COMMIT');
        console.log(`   ✅ Payment ${paymentId}: Successfully migrated`);
        successCount++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`   ❌ Payment ${paymentId}: Migration failed - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 MIGRATION COMPLETED!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
    // Verify final status
    console.log('\n🔍 VERIFICATION - Final Production Status:');
    const verifyResult = await client.query(currentQuery);
    verifyResult.rows.forEach(payment => {
      console.log(`   Payment ${payment.id}: Status '${payment.status}', Release TX: ${payment.release_tx_hash ? 'YES' : 'NO'}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

migratePayments().catch(console.error);
