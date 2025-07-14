require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function fixPaymentEscrowRelationship() {
  console.log('🔧 Fixing payment-escrow relationship issues...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Direct SQL queries to fix the relationship
    console.log('\n🔍 Checking escrow table structure...');
    
    // Check escrows with smart contract IDs 9 and 10 (from the payment details)
    const escrowQuery = `
      SELECT id, smart_contract_escrow_id, blockchain_tx_hash, status, 
             custody_percent, custody_amount, release_amount, custody_end, 
             created_at
      FROM escrow 
      WHERE smart_contract_escrow_id IN ('9', '10')
      ORDER BY id DESC;
    `;
    
    const escrows = await AppDataSource.query(escrowQuery);
    console.log('Found escrows with smart contract IDs 9 and 10:');
    escrows.forEach(escrow => {
      console.log(`  Escrow ${escrow.id}:`);
      console.log(`    - Smart Contract ID: ${escrow.smart_contract_escrow_id}`);
      console.log(`    - Status: ${escrow.status}`);
      console.log(`    - Blockchain TX: ${escrow.blockchain_tx_hash}`);
      console.log(`    - Custody %: ${escrow.custody_percent}%`);
      console.log(`    - Custody Amount: ${escrow.custody_amount}`);
      console.log(`    - Custody End: ${escrow.custody_end}`);
      console.log(`    - Created: ${escrow.created_at}`);
    });

    // Check payment-escrow relationships
    console.log('\n🔍 Checking payment-escrow relationships...');
    const relationshipQuery = `
      SELECT p.id as payment_id, p.amount, p.status as payment_status, 
             p.escrow_id, e.id as actual_escrow_id, e.smart_contract_escrow_id,
             e.status as escrow_status
      FROM payment p
      LEFT JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id IN (112, 113)
      ORDER BY p.id DESC;
    `;
    
    const relationships = await AppDataSource.query(relationshipQuery);
    console.log('Payment-Escrow relationships:');
    relationships.forEach(rel => {
      console.log(`  Payment ${rel.payment_id}:`);
      console.log(`    - Amount: ${rel.amount}`);
      console.log(`    - Payment Status: ${rel.payment_status}`);
      console.log(`    - Escrow ID in payment: ${rel.escrow_id}`);
      console.log(`    - Actual Escrow ID: ${rel.actual_escrow_id}`);
      console.log(`    - Smart Contract ID: ${rel.smart_contract_escrow_id}`);
      console.log(`    - Escrow Status: ${rel.escrow_status}`);
    });

    // Find orphaned escrows and fix relationships
    console.log('\n🔧 Finding and fixing orphaned escrows...');
    
    // Based on the payment details:
    // Payment 113 should link to Escrow with smart_contract_escrow_id = '10'
    // Payment 112 should link to Escrow with smart_contract_escrow_id = '9'
    
    const fixQueries = [
      {
        paymentId: 113,
        smartContractId: '10',
        description: 'Payment 113 -> Escrow 10'
      },
      {
        paymentId: 112,
        smartContractId: '9', 
        description: 'Payment 112 -> Escrow 9'
      }
    ];

    for (const fix of fixQueries) {
      console.log(`\n🔧 Fixing ${fix.description}...`);
      
      // Find the escrow with the matching smart contract ID
      const findEscrowQuery = `
        SELECT id FROM escrow 
        WHERE smart_contract_escrow_id = $1
        LIMIT 1;
      `;
      
      const escrowResult = await AppDataSource.query(findEscrowQuery, [fix.smartContractId]);
      
      if (escrowResult.length > 0) {
        const escrowId = escrowResult[0].id;
        console.log(`  Found escrow ID: ${escrowId}`);
        
        // Update the payment to link to this escrow
        const updatePaymentQuery = `
          UPDATE payment 
          SET escrow_id = $1 
          WHERE id = $2;
        `;
        
        await AppDataSource.query(updatePaymentQuery, [escrowId, fix.paymentId]);
        console.log(`  ✅ Updated payment ${fix.paymentId} to link to escrow ${escrowId}`);
        
        // Also ensure the escrow has the correct payment reference in its payment_id column
        const updateEscrowQuery = `
          UPDATE escrow 
          SET payment_id = $1 
          WHERE id = $2;
        `;
        
        await AppDataSource.query(updateEscrowQuery, [fix.paymentId, escrowId]);
        console.log(`  ✅ Updated escrow ${escrowId} to reference payment ${fix.paymentId}`);
      } else {
        console.log(`  ❌ No escrow found with smart contract ID ${fix.smartContractId}`);
      }
    }

    // Verify the fixes
    console.log('\n✅ Verifying fixes...');
    const verifyQuery = `
      SELECT p.id as payment_id, p.amount, p.status as payment_status, 
             p.escrow_id, e.id as actual_escrow_id, e.smart_contract_escrow_id,
             e.status as escrow_status, e.custody_end
      FROM payment p
      LEFT JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id IN (112, 113)
      ORDER BY p.id DESC;
    `;
    
    const verifyResults = await AppDataSource.query(verifyQuery);
    console.log('Fixed relationships:');
    verifyResults.forEach(rel => {
      console.log(`  Payment ${rel.payment_id}:`);
      console.log(`    - Payment Status: ${rel.payment_status}`);
      console.log(`    - Escrow ID: ${rel.escrow_id}`);
      console.log(`    - Smart Contract ID: ${rel.smart_contract_escrow_id}`);
      console.log(`    - Escrow Status: ${rel.escrow_status}`);
      console.log(`    - Custody End: ${rel.custody_end}`);
      
      const custodyEndTime = new Date(rel.custody_end);
      const now = new Date();
      const isInFuture = custodyEndTime > now;
      const hoursUntilEnd = (custodyEndTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      console.log(`    - Custody ends in: ${hoursUntilEnd.toFixed(2)} hours (${isInFuture ? 'future' : 'past'})`);
    });

  } catch (error) {
    console.error('❌ Error fixing payment-escrow relationship:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
fixPaymentEscrowRelationship();
