require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function fixPaymentEscrowIds() {
  console.log('🔧 Fixing payment escrow_id references...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Fix Payment 113 -> Escrow 29 (smart_contract_escrow_id = '10')
    console.log('\n🔧 Fixing Payment 113...');
    const updatePayment113 = `
      UPDATE payment 
      SET escrow_id = 29 
      WHERE id = 113;
    `;
    await AppDataSource.query(updatePayment113);
    console.log('✅ Payment 113 now linked to Escrow 29');

    // Fix Payment 112 -> Escrow 15 (smart_contract_escrow_id = '9')
    console.log('\n🔧 Fixing Payment 112...');
    const updatePayment112 = `
      UPDATE payment 
      SET escrow_id = 15 
      WHERE id = 112;
    `;
    await AppDataSource.query(updatePayment112);
    console.log('✅ Payment 112 now linked to Escrow 15');

    // Verify the fixes
    console.log('\n✅ Verifying fixes...');
    const verifyQuery = `
      SELECT p.id as payment_id, p.amount, p.status as payment_status, 
             p.escrow_id, e.id as actual_escrow_id, e.smart_contract_escrow_id,
             e.status as escrow_status, e.custody_end, e.custody_percent
      FROM payment p
      LEFT JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id IN (112, 113)
      ORDER BY p.id DESC;
    `;
    
    const results = await AppDataSource.query(verifyQuery);
    console.log('\n📊 Fixed relationships:');
    results.forEach(rel => {
      console.log(`  Payment ${rel.payment_id}:`);
      console.log(`    - Amount: $${rel.amount}`);
      console.log(`    - Payment Status: ${rel.payment_status}`);
      console.log(`    - Escrow ID: ${rel.escrow_id}`);
      console.log(`    - Smart Contract ID: ${rel.smart_contract_escrow_id}`);
      console.log(`    - Escrow Status: ${rel.escrow_status}`);
      console.log(`    - Custody %: ${rel.custody_percent}%`);
      console.log(`    - Custody End: ${rel.custody_end}`);
      
      // Check if custody end is in the future
      const custodyEndTime = new Date(rel.custody_end);
      const now = new Date();
      const isInFuture = custodyEndTime > now;
      const hoursUntilEnd = (custodyEndTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log(`    - Time until custody end: ${hoursUntilEnd.toFixed(2)} hours`);
      console.log(`    - Status: ${isInFuture ? '🟢 Future' : '🔴 Past'}`);
    });

    // Check if there are any other nuevo_flujo payments with missing escrow_id
    console.log('\n🔍 Checking for other nuevo_flujo payments with missing escrow_id...');
    const orphanedQuery = `
      SELECT p.id, p.amount, p.status, p.payment_type, p.escrow_id
      FROM payment p
      WHERE p.payment_type = 'nuevo_flujo' 
        AND p.escrow_id IS NULL
      ORDER BY p.id DESC;
    `;
    
    const orphaned = await AppDataSource.query(orphanedQuery);
    if (orphaned.length > 0) {
      console.log(`Found ${orphaned.length} nuevo_flujo payments with missing escrow_id:`);
      orphaned.forEach(payment => {
        console.log(`  - Payment ${payment.id}: $${payment.amount} (${payment.status})`);
      });
    } else {
      console.log('✅ No orphaned nuevo_flujo payments found');
    }

  } catch (error) {
    console.error('❌ Error fixing payment escrow IDs:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
fixPaymentEscrowIds();
