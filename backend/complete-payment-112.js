require('dotenv').config();
const { ethers } = require('ethers');
const mysql = require('mysql2/promise');
const { createHmac } = require('crypto');
const axios = require('axios');

// Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '140290',
  database: process.env.DB_NAME || 'kustodia_local'
};

const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
const JUNO_WALLET = process.env.JUNO_WALLET;
const BRIDGE_WALLET_PK = process.env.DEPLOYER_PRIVATE_KEY;
const PROVIDER_URL = process.env.ETH_RPC_URL;

// Juno configuration
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

async function transferBridgeToJuno(amount) {
  console.log(`\n💸 Transferring ${amount} MXNB from Bridge to Juno...`);
  
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
  const tokenContract = new ethers.Contract(
    MXNB_TOKEN, 
    ['function transfer(address to, uint256 amount)', 'function balanceOf(address) view returns (uint256)'], 
    wallet
  );

  // Check bridge wallet balance
  const balance = await tokenContract.balanceOf(wallet.address);
  const balanceInMXNB = ethers.formatUnits(balance, 6);
  console.log(`   Bridge wallet MXNB balance: ${balanceInMXNB}`);

  if (Number(balanceInMXNB) < amount) {
    throw new Error(`Insufficient MXNB balance. Have ${balanceInMXNB}, need ${amount}`);
  }

  const decimals = 6; // MXNB uses 6 decimals
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);

  console.log(`   Sending transaction...`);
  const tx = await tokenContract.transfer(JUNO_WALLET, amountInWei);
  console.log(`   Transaction sent: ${tx.hash}`);
  
  await tx.wait();
  console.log(`   ✅ Transfer confirmed!`);
  
  return tx.hash;
}

async function redeemMXNBToMXN(amount, beneficiary, clabe, reference) {
  console.log(`\n💱 Redeeming ${amount} MXNB to MXN via Juno...`);
  
  const endpoint = '/mint_platform/v1/spei_payouts';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: amount.toString(),
    beneficiary: beneficiary,
    clabe: clabe,
    notes_ref: reference,
    numeric_ref: "112",
    rfc: "XAXX010101000",
    origin_id: `kustodia_payout_112_${Date.now()}`
  };

  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

  const headers = {
    'X-Api-Key': JUNO_API_KEY,
    'X-Nonce': nonce,
    'X-Signature': signature,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log(`   ✅ Payout initiated:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`   ❌ Payout failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function completePayment112() {
  const pool = await mysql.createPool(dbConfig);
  
  try {
    console.log('🔧 Completing Payment #112 Flow...\n');
    
    // Get payment details
    const [results] = await pool.execute(`
      SELECT 
        p.id, p.amount, p.commission_amount, p.status,
        p.recipient_email, p.commission_beneficiary_email,
        p.description, p.reference,
        e.id as escrow_id, e.status as escrow_status,
        e.release_amount, e.smart_contract_escrow_id,
        s.full_name as seller_name, s.payout_clabe as seller_clabe,
        s.email as seller_email
      FROM payment p
      JOIN escrow e ON p.escrow_id = e.id
      JOIN user s ON p.recipient_id = s.id
      WHERE p.id = 112
    `);
    
    if (results.length === 0) {
      throw new Error('Payment 112 not found');
    }
    
    const payment = results[0];
    console.log('📋 Payment Details:');
    console.log(`   Amount: ${payment.amount} MXN`);
    console.log(`   Commission: ${payment.commission_amount || 0} MXN`);
    console.log(`   Net to Seller: ${payment.amount - (payment.commission_amount || 0)} MXN`);
    console.log(`   Seller: ${payment.seller_name} (${payment.seller_email})`);
    console.log(`   Seller CLABE: ${payment.seller_clabe}`);
    console.log(`   Escrow Status: ${payment.escrow_status}`);
    
    // Step 1: Transfer MXNB from Bridge to Juno
    const totalAmount = Number(payment.release_amount || payment.amount);
    const transferTxHash = await transferBridgeToJuno(totalAmount);
    
    // Log the transfer
    await pool.execute(`
      INSERT INTO payment_event (payment_id, type, description, created_at)
      VALUES (?, ?, ?, NOW())
    `, [112, 'bridge_to_juno_transfer', `Transferred ${totalAmount} MXNB to Juno. Tx: ${transferTxHash}`]);
    
    // Step 2: Redeem MXNB to MXN and send SPEI to seller
    const netSellerAmount = totalAmount - (payment.commission_amount || 0);
    const payoutResult = await redeemMXNBToMXN(
      netSellerAmount,
      payment.seller_name || payment.seller_email,
      payment.seller_clabe,
      payment.description || "Pago Kustodia"
    );
    
    // Log the payout
    await pool.execute(`
      INSERT INTO payment_event (payment_id, type, description, created_at)
      VALUES (?, ?, ?, NOW())
    `, [112, 'seller_payout_initiated', `SPEI payout initiated for ${netSellerAmount} MXN to seller`]);
    
    // Step 3: Update payment and escrow status
    await pool.execute(`
      UPDATE payment SET status = 'completed' WHERE id = 112
    `);
    
    await pool.execute(`
      UPDATE escrow SET status = 'released' WHERE id = ?
    `, [payment.escrow_id]);
    
    console.log('\n✅ Payment #112 completed successfully!');
    console.log('   - MXNB transferred to Juno');
    console.log('   - SPEI payout initiated to seller');
    console.log('   - Database status updated');
    
    // Step 4: Handle commission if any
    if (payment.commission_amount > 0 && payment.commission_beneficiary_email) {
      console.log('\n💰 Processing commission payment...');
      // Get commission beneficiary details
      const [commissionUser] = await pool.execute(`
        SELECT full_name, payout_clabe FROM user WHERE email = ?
      `, [payment.commission_beneficiary_email]);
      
      if (commissionUser.length > 0 && commissionUser[0].payout_clabe) {
        const commissionResult = await redeemMXNBToMXN(
          payment.commission_amount,
          commissionUser[0].full_name || payment.commission_beneficiary_email,
          commissionUser[0].payout_clabe,
          "Comisión Kustodia"
        );
        
        await pool.execute(`
          INSERT INTO payment_event (payment_id, type, description, created_at)
          VALUES (?, ?, ?, NOW())
        `, [112, 'commission_payout_initiated', `Commission payout initiated for ${payment.commission_amount} MXN`]);
        
        console.log('   ✅ Commission payout initiated');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Log the error
    await pool.execute(`
      INSERT INTO payment_event (payment_id, type, description, is_error, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [112, 'manual_completion_error', error.message, true]);
    
  } finally {
    await pool.end();
  }
}

// Run the completion
completePayment112();
