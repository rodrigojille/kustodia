require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function fixEscrowAmountsPayment81() {
  console.log('🔧 FIXING ESCROW AMOUNTS FOR PAYMENT 81');
  console.log('======================================');
  
  try {
    await client.connect();
    
    // Step 1: Check current escrow data
    console.log('📊 Step 1: Current Escrow Data');
    
    const escrowQuery = await client.query(`
      SELECT 
        e.id,
        e.payment_id,
        e.custody_amount,
        e.release_amount,
        e.custody_percent,
        e.status,
        p.amount as payment_amount,
        p.status as payment_status
      FROM escrow e
      JOIN payment p ON p.id = e.payment_id
      WHERE e.payment_id = 81
    `);
    
    if (escrowQuery.rows.length === 0) {
      throw new Error('Escrow for Payment 81 not found');
    }
    
    const escrow = escrowQuery.rows[0];
    
    console.log('Current escrow values:');
    console.log(`Payment ID: ${escrow.payment_id}`);
    console.log(`Payment Status: ${escrow.payment_status}`);
    console.log(`Payment Amount: $${escrow.payment_amount} MXN`);
    console.log(`Escrow Status: ${escrow.status}`);
    console.log(`Custody Amount: $${escrow.custody_amount} MXNB`);
    console.log(`Release Amount: $${escrow.release_amount || 0} MXNB`);
    console.log(`Custody Percent: ${escrow.custody_percent}%`);
    console.log('');
    
    // Step 2: Calculate what the amounts should be
    console.log('🧮 Step 2: Calculating Correct Amounts');
    
    const paymentAmount = parseFloat(escrow.payment_amount);
    const custodyPercent = parseFloat(escrow.custody_percent);
    const expectedCustodyAmount = (paymentAmount * custodyPercent) / 100;
    
    console.log(`Payment Amount: $${paymentAmount} MXN`);
    console.log(`Custody Percentage: ${custodyPercent}%`);
    console.log(`Expected Custody Amount: $${expectedCustodyAmount} MXNB`);
    
    // If payment is completed, release_amount should equal custody_amount
    let expectedReleaseAmount = 0;
    if (escrow.payment_status === 'completed' && escrow.status === 'released') {
      expectedReleaseAmount = expectedCustodyAmount;
      console.log(`Expected Release Amount: $${expectedReleaseAmount} MXNB (payment completed)`);
    } else {
      console.log(`Expected Release Amount: $${expectedReleaseAmount} MXNB (payment not completed)`);
    }
    
    console.log('');
    
    // Step 3: Update escrow amounts
    console.log('💰 Step 3: Updating Escrow Amounts');
    
    const currentCustodyAmount = parseFloat(escrow.custody_amount);
    const currentReleaseAmount = parseFloat(escrow.release_amount || 0);
    
    let needsUpdate = false;
    
    if (currentCustodyAmount !== expectedCustodyAmount) {
      console.log(`Custody amount needs update: ${currentCustodyAmount} → ${expectedCustodyAmount}`);
      needsUpdate = true;
    }
    
    if (currentReleaseAmount !== expectedReleaseAmount) {
      console.log(`Release amount needs update: ${currentReleaseAmount} → ${expectedReleaseAmount}`);
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await client.query(`
        UPDATE escrow 
        SET 
          custody_amount = $1,
          release_amount = $2,
          updated_at = NOW()
        WHERE payment_id = 81
      `, [expectedCustodyAmount, expectedReleaseAmount]);
      
      console.log('✅ Updated escrow amounts');
    } else {
      console.log('ℹ️ Escrow amounts are already correct');
    }
    
    console.log('');
    
    // Step 4: Verify the fix
    console.log('🎯 Step 4: Verification');
    
    const verificationQuery = await client.query(`
      SELECT 
        e.custody_amount,
        e.release_amount,
        e.status,
        p.amount as payment_amount,
        p.status as payment_status
      FROM escrow e
      JOIN payment p ON p.id = e.payment_id
      WHERE e.payment_id = 81
    `);
    
    const updatedEscrow = verificationQuery.rows[0];
    const custodyAmount = parseFloat(updatedEscrow.custody_amount);
    const releaseAmount = parseFloat(updatedEscrow.release_amount || 0);
    const montoPorPagar = custodyAmount - releaseAmount;
    
    console.log('📊 UPDATED ESCROW STATUS:');
    console.log(`Payment Status: ${updatedEscrow.payment_status}`);
    console.log(`Escrow Status: ${updatedEscrow.status}`);
    console.log(`Custody Amount: $${custodyAmount} MXNB`);
    console.log(`Release Amount: $${releaseAmount} MXNB`);
    console.log(`Monto Por Pagar: $${montoPorPagar} MXNB`);
    console.log('');
    
    if (montoPorPagar === 0 && updatedEscrow.payment_status === 'completed') {
      console.log('🎉 SUCCESS: Monto por pagar is now $0.00!');
    } else if (updatedEscrow.payment_status === 'completed') {
      console.log(`⚠️ Issue: Payment is completed but Monto por pagar is still $${montoPorPagar}`);
    }
    
    // Step 5: Test the API response format
    console.log('🔍 Step 5: API Response Preview');
    console.log('This is what the frontend will calculate:');
    console.log(`custody_amount: ${custodyAmount}`);
    console.log(`release_amount: ${releaseAmount}`);
    console.log(`monto_por_pagar: custody_amount - release_amount = ${montoPorPagar}`);
    
    return {
      success: true,
      paymentId: 81,
      custodyAmount,
      releaseAmount,
      montoPorPagar,
      paymentStatus: updatedEscrow.payment_status,
      escrowStatus: updatedEscrow.status
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

fixEscrowAmountsPayment81();
