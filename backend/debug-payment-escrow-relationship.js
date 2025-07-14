require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function debugPaymentEscrowRelationship() {
  console.log('🔍 Debugging payment-escrow relationship issues...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);

    // Check Payment 113 and 112 specifically
    const targetPayments = [113, 112];
    
    for (const paymentId of targetPayments) {
      console.log(`\n--- Analyzing Payment ${paymentId} ---`);
      
      // Get payment with explicit escrow relation
      const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['escrow']
      });
      
      if (!payment) {
        console.log(`❌ Payment ${paymentId} not found`);
        continue;
      }
      
      console.log(`Payment ${paymentId} details:`);
      console.log(`  - Amount: ${payment.amount}`);
      console.log(`  - Status: ${payment.status}`);
      console.log(`  - Type: ${payment.payment_type}`);
      console.log(`  - Created: ${payment.created_at}`);
      console.log(`  - Escrow ID field: ${payment.escrow_id}`);
      console.log(`  - Has escrow relation: ${!!payment.escrow}`);
      
      // Search for escrows that might belong to this payment
      const relatedEscrows = await escrowRepo.find({
        where: { payment_id: paymentId }
      });
      
      console.log(`  - Related escrows found: ${relatedEscrows.length}`);
      
      if (relatedEscrows.length > 0) {
        relatedEscrows.forEach((escrow, index) => {
          console.log(`    Escrow ${index + 1}:`);
          console.log(`      - ID: ${escrow.id}`);
          console.log(`      - Status: ${escrow.status}`);
          console.log(`      - Custody %: ${escrow.custody_percent}%`);
          console.log(`      - Custody Amount: ${escrow.custody_amount}`);
          console.log(`      - Release Amount: ${escrow.release_amount}`);
          console.log(`      - Created: ${escrow.created_at}`);
          console.log(`      - Custody End: ${escrow.custody_end}`);
          console.log(`      - Payment ID: ${escrow.payment_id}`);
          console.log(`      - Smart Contract ID: ${escrow.smart_contract_escrow_id || 'None'}`);
          
          // Check if payment.escrow_id matches this escrow
          if (payment.escrow_id !== escrow.id) {
            console.log(`      ⚠️ MISMATCH: Payment.escrow_id (${payment.escrow_id}) != Escrow.id (${escrow.id})`);
            
            // Fix the relationship
            console.log(`      🔧 Fixing payment.escrow_id...`);
            payment.escrow_id = escrow.id;
          }
        });
        
        // Save the fixed payment if needed
        if (payment.escrow_id !== relatedEscrows[0].id) {
          await paymentRepo.save(payment);
          console.log(`      ✅ Fixed payment ${paymentId} escrow_id`);
        }
      } else {
        console.log(`    ❌ No escrows found for payment ${paymentId}`);
      }
    }

    // Check all nuevo_flujo payments for similar issues
    console.log('\n🔍 Checking all nuevo_flujo payments for escrow relationship issues...');
    
    const allNuevoFlujo = await paymentRepo.find({
      where: { payment_type: 'nuevo_flujo' },
      order: { created_at: 'DESC' }
    });
    
    console.log(`Found ${allNuevoFlujo.length} nuevo_flujo payments`);
    
    let fixedCount = 0;
    for (const payment of allNuevoFlujo) {
      if (!payment.escrow_id) {
        // Look for orphaned escrows
        const orphanedEscrows = await escrowRepo.find({
          where: { payment_id: payment.id }
        });
        
        if (orphanedEscrows.length > 0) {
          console.log(`🔧 Fixing orphaned escrow for payment ${payment.id}`);
          payment.escrow_id = orphanedEscrows[0].id;
          await paymentRepo.save(payment);
          fixedCount++;
        }
      }
    }
    
    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} orphaned escrow relationships`);
    } else {
      console.log(`✅ No orphaned escrows found`);
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifyPayments = await paymentRepo.find({
      where: [{ id: 113 }, { id: 112 }],
      relations: ['escrow']
    });
    
    verifyPayments.forEach(payment => {
      console.log(`Payment ${payment.id}:`);
      console.log(`  - Escrow ID: ${payment.escrow_id}`);
      console.log(`  - Has escrow relation: ${!!payment.escrow}`);
      if (payment.escrow) {
        console.log(`  - Escrow status: ${payment.escrow.status}`);
        console.log(`  - Custody end: ${payment.escrow.custody_end}`);
      }
    });

  } catch (error) {
    console.error('❌ Error debugging payment-escrow relationship:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
debugPaymentEscrowRelationship();
