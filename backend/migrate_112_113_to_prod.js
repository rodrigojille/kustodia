// Migrate Payments 112 & 113 Status to Production
// Simple script to update production database with local status

const { Client } = require('pg');
require('dotenv').config();

// CONFIGURATION - Update these values
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL_PROD || 'REPLACE_WITH_PROD_URL';
const LOCAL_DATABASE_URL = process.env.DATABASE_URL;

// Payment data from local database (exact values)
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

async function migrateToProduction() {
  console.log('🚀 MIGRATE PAYMENTS 112 & 113 TO PRODUCTION');
  console.log('=' .repeat(60));
  
  // Validate configuration
  if (PRODUCTION_DATABASE_URL === 'REPLACE_WITH_PROD_URL') {
    console.log('❌ Please update PRODUCTION_DATABASE_URL in the script');
    return;
  }

  const prodClient = new Client({
    connectionString: PRODUCTION_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await prodClient.connect();
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
        e.release_tx_hash
      FROM payment p
      LEFT JOIN escrow e ON p.id = e.payment_id
      WHERE p.id IN (112, 113)
      ORDER BY p.id;
    `;
    
    const currentResult = await prodClient.query(currentQuery);
    
    currentResult.rows.forEach(payment => {
      console.log(`\n💰 Production Payment ${payment.id}:`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Payer Approval: ${payment.payer_approval ? '✅' : '❌'}`);
      console.log(`   Payee Approval: ${payment.payee_approval ? '✅' : '❌'}`);
      console.log(`   Escrow Status: ${payment.escrow_status || 'None'}`);
      console.log(`   Release TX: ${payment.release_tx_hash || 'None'}`);
    });

    // 2. Show migration plan
    console.log('\n📝 MIGRATION PLAN:');
    
    for (const [paymentId, localData] of Object.entries(PAYMENT_DATA)) {
      const prodPayment = currentResult.rows.find(p => p.id == paymentId);
      
      if (!prodPayment) {
        console.log(`⚠️  Payment ${paymentId}: Not found in production`);
        continue;
      }
      
      console.log(`\n🎯 Payment ${paymentId}:`);
      console.log(`   Status: '${prodPayment.status}' → '${localData.status}'`);
      console.log(`   Payer Approval: ${prodPayment.payer_approval} → ${localData.payer_approval}`);
      console.log(`   Payee Approval: ${prodPayment.payee_approval} → ${localData.payee_approval}`);
      console.log(`   Escrow Status: '${prodPayment.escrow_status}' → '${localData.escrow_status}'`);
      console.log(`   Release TX: '${prodPayment.release_tx_hash || 'None'}' → '${localData.release_tx_hash}'`);
    }

    // 3. Execute migration
    const EXECUTE = false; // Set to true to execute
    
    if (EXECUTE) {
      console.log('\n⚡ EXECUTING MIGRATION:');
      
      for (const [paymentId, localData] of Object.entries(PAYMENT_DATA)) {
        try {
          await prodClient.query('BEGIN');
          
          // Update payment
          await prodClient.query(`
            UPDATE payment 
            SET status = $1, payer_approval = $2, payee_approval = $3, updated_at = NOW()
            WHERE id = $4
          `, [localData.status, localData.payer_approval, localData.payee_approval, paymentId]);
          
          // Update escrow
          await prodClient.query(`
            UPDATE escrow 
            SET status = $1, release_tx_hash = $2, smart_contract_escrow_id = $3, updated_at = NOW()
            WHERE payment_id = $4
          `, [localData.escrow_status, localData.release_tx_hash, localData.smart_contract_escrow_id, paymentId]);
          
          // Add migration event
          await prodClient.query(`
            INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
            VALUES ($1, $2, $3, $4, NOW())
          `, [
            paymentId,
            'production_sync',
            'Estado migrado desde desarrollo - pago completado y custodia liberada',
            true
          ]);
          
          await prodClient.query('COMMIT');
          console.log(`   ✅ Payment ${paymentId}: Successfully migrated`);
          
        } catch (error) {
          await prodClient.query('ROLLBACK');
          console.log(`   ❌ Payment ${paymentId}: Migration failed - ${error.message}`);
        }
      }
      
      console.log('\n🎉 MIGRATION COMPLETED!');
    } else {
      console.log('\n🧪 DRY RUN - No changes made');
      console.log('   To execute migration:');
      console.log('   1. Update PRODUCTION_DATABASE_URL with your prod DB URL');
      console.log('   2. Update PAYMENT_DATA with exact values from local DB');
      console.log('   3. Set EXECUTE = true');
      console.log('   4. Run the script again');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prodClient.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Instructions
console.log('📋 MIGRATION INSTRUCTIONS:');
console.log('1. Get your production database URL');
console.log('2. Update PRODUCTION_DATABASE_URL in this script');
console.log('3. Verify PAYMENT_DATA matches your local database');
console.log('4. Set EXECUTE = true when ready');
console.log('5. Run: node migrate_112_113_to_prod.js');
console.log('');

// Run migration
migrateToProduction().catch(console.error);
