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

async function verifyPayment81FinalStatus() {
  console.log('🔍 FINAL STATUS VERIFICATION - PAYMENT 81');
  console.log('=========================================');
  
  try {
    await client.connect();
    
    // Database status
    console.log('📊 DATABASE STATUS:');
    const paymentQuery = await client.query(`
      SELECT 
        p.id,
        p.status as payment_status,
        p.amount,
        p.recipient_email,
        p.payout_clabe,
        e.id as escrow_id,
        e.status as escrow_status,
        e.custody_amount,
        e.release_tx_hash,
        e.smart_contract_escrow_id
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    if (paymentQuery.rows.length > 0) {
      const row = paymentQuery.rows[0];
      console.log(`Payment ID: ${row.id}`);
      console.log(`Payment Status: ${row.payment_status}`);
      console.log(`Amount: ${row.amount} MXN`);
      console.log(`Recipient: ${row.recipient_email}`);
      console.log(`Payout CLABE: ${row.payout_clabe}`);
      console.log(`Escrow ID: ${row.escrow_id}`);
      console.log(`Escrow Status: ${row.escrow_status}`);
      console.log(`Custody Amount: ${row.custody_amount} MXNB`);
      console.log(`Release TX Hash: ${row.release_tx_hash || 'N/A'}`);
      console.log(`Smart Contract Escrow ID: ${row.smart_contract_escrow_id || 'N/A'}`);
    }
    
    // Payment events
    console.log('\n📋 PAYMENT EVENTS:');
    const eventsQuery = await client.query(`
      SELECT type, data, timestamp
      FROM payment_event
      WHERE payment_id = 81
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    
    for (const event of eventsQuery.rows) {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log(`${event.timestamp.toISOString()}: ${event.type}`);
      if (data.txHash) console.log(`  TX: ${data.txHash}`);
      if (data.amount) console.log(`  Amount: ${data.amount}`);
      if (data.junoResponse) console.log(`  Juno Response: ${JSON.stringify(data.junoResponse).substring(0, 100)}...`);
    }
    
    // Blockchain status
    console.log('\n🔗 BLOCKCHAIN STATUS:');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // MXNB balances
    const mxnbContract = new ethers.Contract(MXNB_TOKEN, [
      "function balanceOf(address) view returns (uint256)"
    ], provider);
    
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log(`Bridge Wallet Balance: ${ethers.utils.formatUnits(bridgeBalance, 6)} MXNB`);
    console.log(`Escrow Contract Balance: ${ethers.utils.formatUnits(escrowBalance, 6)} MXNB`);
    
    // Smart contract escrow status
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
    ], provider);
    
    const escrowDetails = await escrowContract.escrows(1); // Assuming Escrow ID 1
    console.log(`Smart Contract Escrow Status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    console.log(`Smart Contract Amount: ${ethers.utils.formatUnits(escrowDetails[2], 6)} MXNB`);
    
    // Final analysis
    console.log('\n🎯 FINAL ANALYSIS:');
    const isReleased = escrowDetails[6] === 2;
    const hasEvents = eventsQuery.rows.length > 0;
    const hasRedemptionEvent = eventsQuery.rows.some(e => e.type === 'mxnb_redeemed');
    
    console.log(`✅ Escrow Released: ${isReleased ? 'YES' : 'NO'}`);
    console.log(`✅ Has Events: ${hasEvents ? 'YES' : 'NO'}`);
    console.log(`✅ MXNB Redeemed: ${hasRedemptionEvent ? 'YES' : 'NO'}`);
    
    if (isReleased && hasRedemptionEvent) {
      console.log('\n🎉 PAYMENT 81 FLOW COMPLETED SUCCESSFULLY!');
      console.log('✅ Escrow released from smart contract');
      console.log('✅ MXNB redeemed via Juno API');
      console.log('✅ Payment should be completed');
    } else {
      console.log('\n⚠️ PAYMENT 81 FLOW INCOMPLETE');
      if (!isReleased) console.log('❌ Escrow not yet released');
      if (!hasRedemptionEvent) console.log('❌ MXNB not yet redeemed');
    }
    
  } catch (error) {
    console.error('❌ Error verifying status:', error.message);
  } finally {
    await client.end();
  }
}

verifyPayment81FinalStatus();
