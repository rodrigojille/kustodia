require('dotenv').config();
const { Client } = require('pg');
const { ethers } = require('ethers');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const RPC_URL = process.env.ETH_RPC_URL;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;

async function finalPayment81Verification() {
  console.log('🔍 FINAL COMPLETE VERIFICATION - PAYMENT 81');
  console.log('===========================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  try {
    await client.connect();
    
    // 1. Database Status Check
    console.log('📊 1. DATABASE STATUS VERIFICATION:');
    console.log('----------------------------------');
    
    const paymentStatus = await client.query(`
      SELECT 
        p.id,
        p.status as payment_status,
        p.amount,
        p.recipient_email,
        p.payout_clabe,
        p.created_at as payment_created,
        e.id as escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        e.release_tx_hash,
        e.smart_contract_escrow_id
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    if (paymentStatus.rows.length === 0) {
      throw new Error('Payment 81 not found');
    }
    
    const payment = paymentStatus.rows[0];
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Payment Status: ${payment.payment_status} ${payment.payment_status === 'completed' ? '✅' : '🔄'}`);
    console.log(`Amount: ${payment.amount} MXN`);
    console.log(`Recipient: ${payment.recipient_email}`);
    console.log(`Payout CLABE: ${payment.payout_clabe}`);
    console.log(`Payment Created: ${payment.payment_created}`);
    console.log(`Escrow ID: ${payment.escrow_id}`);
    console.log(`Escrow Status: ${payment.escrow_status} ${payment.escrow_status === 'released' ? '✅' : '❌'}`);
    console.log(`Custody Amount: ${payment.custody_amount} MXNB`);
    console.log(`Release TX Hash: ${payment.release_tx_hash || 'N/A'}`);
    console.log(`Smart Contract Escrow ID: ${payment.smart_contract_escrow_id}`);
    
    // 2. Payment Events Check
    console.log('');
    console.log('📋 2. PAYMENT EVENTS TIMELINE:');
    console.log('------------------------------');
    
    const events = await client.query(`
      SELECT type, description, created_at
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at ASC
    `);
    
    const eventTypes = {};
    events.rows.forEach(event => {
      eventTypes[event.type] = true;
      console.log(`${event.created_at.toISOString()}: ${event.type}`);
      if (event.description) {
        console.log(`  └─ ${event.description}`);
      }
    });
    
    // 3. Blockchain Status Check
    console.log('');
    console.log('🔗 3. BLOCKCHAIN STATUS VERIFICATION:');
    console.log('------------------------------------');
    
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Check MXNB balances
    const mxnbContract = new ethers.Contract(MXNB_TOKEN, [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ], provider);
    
    const decimals = await mxnbContract.decimals();
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log(`Bridge Wallet Balance: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
    console.log(`Escrow Contract Balance: ${ethers.utils.formatUnits(escrowBalance, decimals)} MXNB`);
    
    // Check smart contract escrow status
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
    ], provider);
    
    const escrowDetails = await escrowContract.escrows(1); // Payment 81 = Escrow ID 1
    console.log(`Smart Contract Escrow Status: ${escrowDetails[6]} ${escrowDetails[6] === 2 ? '✅ RELEASED' : '❌ NOT RELEASED'}`);
    console.log(`Smart Contract Amount: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
    
    // 4. Flow Completion Analysis
    console.log('');
    console.log('🎯 4. FLOW COMPLETION ANALYSIS:');
    console.log('-------------------------------');
    
    const checks = {
      escrowReleased: escrowDetails[6] === 2,
      databaseUpdated: payment.escrow_status === 'released',
      fundsInBridgeWallet: bridgeBalance.gte(ethers.utils.parseUnits('1000', decimals)),
      hasReleaseEvent: eventTypes['escrow_released'] || false,
      hasRedemptionEvent: eventTypes['mxnb_redeemed'] || false,
      paymentCompleted: payment.payment_status === 'completed'
    };
    
    console.log(`✅ Escrow Released (Blockchain): ${checks.escrowReleased ? 'YES' : 'NO'}`);
    console.log(`✅ Database Updated: ${checks.databaseUpdated ? 'YES' : 'NO'}`);
    console.log(`✅ Funds in Bridge Wallet: ${checks.fundsInBridgeWallet ? 'YES' : 'NO'}`);
    console.log(`✅ Release Event Logged: ${checks.hasReleaseEvent ? 'YES' : 'NO'}`);
    console.log(`✅ Redemption Event Logged: ${checks.hasRedemptionEvent ? 'YES' : 'NO'}`);
    console.log(`✅ Payment Completed: ${checks.paymentCompleted ? 'YES' : 'NO'}`);
    
    const allComplete = Object.values(checks).every(check => check === true);
    
    console.log('');
    console.log('🏁 5. FINAL RESULT:');
    console.log('-------------------');
    
    if (allComplete) {
      console.log('🎉 PAYMENT 81 FLOW 100% COMPLETED SUCCESSFULLY!');
      console.log('');
      console.log('✅ COMPLETE FLOW SUMMARY:');
      console.log(`   1. Escrow Created & Funded: 1000 MXNB`);
      console.log(`   2. Custody Period Ended: Automatic release triggered`);
      console.log(`   3. Smart Contract Release: 1000 MXNB → Bridge Wallet`);
      console.log(`   4. Database Updated: Escrow status = released`);
      console.log(`   5. MXNB Redemption: 1000 MXNB → 1000 MXN via Juno`);
      console.log(`   6. SPEI Payout: 1000 MXN → ${payment.payout_clabe}`);
      console.log(`   7. Payment Completed: Status = completed`);
      console.log('');
      console.log(`💰 Final Recipient: ${payment.recipient_email}`);
      console.log(`🏦 Final Payout: 1000 MXN to CLABE ${payment.payout_clabe}`);
      console.log(`📊 Total Events Logged: ${events.rows.length}`);
    } else {
      console.log('⚠️ PAYMENT 81 FLOW PARTIALLY COMPLETED');
      console.log('');
      console.log('❌ MISSING STEPS:');
      if (!checks.escrowReleased) console.log('   - Smart contract escrow not released');
      if (!checks.databaseUpdated) console.log('   - Database escrow status not updated');
      if (!checks.fundsInBridgeWallet) console.log('   - Insufficient funds in bridge wallet');
      if (!checks.hasReleaseEvent) console.log('   - Escrow release event not logged');
      if (!checks.hasRedemptionEvent) console.log('   - MXNB redemption not completed');
      if (!checks.paymentCompleted) console.log('   - Payment status not marked as completed');
    }
    
    return {
      success: true,
      completed: allComplete,
      checks: checks,
      paymentAmount: payment.amount,
      custodyAmount: payment.custody_amount,
      recipient: payment.recipient_email,
      payoutClabe: payment.payout_clabe,
      totalEvents: events.rows.length
    };
    
  } catch (error) {
    console.error('❌ Error in final verification:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

finalPayment81Verification();
