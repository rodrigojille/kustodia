require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites for Payment 83 escrow creation...');
  
  try {
    await client.connect();
    console.log('✅ Database connected');
    
    // Check if Payment 83 exists
    const payment = await client.query('SELECT * FROM payment WHERE id = 83');
    if (payment.rows.length === 0) {
      console.log('❌ Payment 83 not found');
      return false;
    }
    console.log('✅ Payment 83 found');
    
    // Check if Escrow 71 exists
    const escrow = await client.query('SELECT * FROM escrow WHERE payment_id = 83');
    if (escrow.rows.length === 0) {
      console.log('❌ Escrow not found for Payment 83');
      return false;
    }
    console.log('✅ Escrow 71 found');
    
    const e = escrow.rows[0];
    console.log(`Escrow Status: ${e.status}`);
    console.log(`Custody Amount: ${e.custody_amount} MXNB`);
    console.log(`Smart Contract ID: ${e.smart_contract_escrow_id || 'NOT SET'}`);
    console.log(`Blockchain TX Hash: ${e.blockchain_tx_hash || 'NOT SET'}`);
    
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    console.log(`ESCROW_BRIDGE_WALLET: ${process.env.ESCROW_BRIDGE_WALLET ? '✅ SET' : '❌ MISSING'}`);
    console.log(`MOCK_ERC20_ADDRESS: ${process.env.MOCK_ERC20_ADDRESS ? '✅ SET' : '❌ MISSING'}`);
    console.log(`ESCROW_CONTRACT_ADDRESS_2: ${process.env.ESCROW_CONTRACT_ADDRESS_2 ? '✅ SET' : '❌ MISSING'}`);
    console.log(`ETH_RPC_URL: ${process.env.ETH_RPC_URL ? '✅ SET' : '❌ MISSING'}`);
    console.log(`ESCROW_PRIVATE_KEY: ${process.env.ESCROW_PRIVATE_KEY ? '✅ SET' : '❌ MISSING'}`);
    
    if (!e.smart_contract_escrow_id) {
      console.log('\n🎯 READY TO CREATE ESCROW ON-CHAIN');
      console.log('Next step: Run the escrow creation script');
      return true;
    } else {
      console.log('\n✅ Escrow already exists on-chain');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

checkPrerequisites();
