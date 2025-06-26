const { DataSource } = require('typeorm');
const axios = require('axios');
const crypto = require('crypto');

// Database connection setup
const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '140290',
  database: process.env.POSTGRES_DB || 'kustodia',
  entities: ["src/entities/*.ts"],
  synchronize: false,
  logging: false,
});

// Juno API config
const JUNO_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_STAGE_API_SECRET;
const JUNO_BASE_URL = 'https://stage.buildwithjuno.com';

async function createJunoWithdrawal(amount, walletAddress) {
  const requestPath = '/v1/withdrawals';
  const method = 'POST';
  const nonce = Date.now().toString();
  
  const body = JSON.stringify({
    currency: 'mxnb',
    amount: amount.toString(),
    address: walletAddress,
    memo: `Payment 84 custody funding`
  });
  
  const stringToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(stringToSign).digest('hex');
  
  console.log('[JUNO] Creating withdrawal request...');
  console.log('Amount:', amount, 'MXNB');
  console.log('Bridge wallet:', walletAddress);
  
  try {
    const response = await axios.post(JUNO_BASE_URL + requestPath, JSON.parse(body), {
      headers: {
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Withdrawal created successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Error creating withdrawal:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function updateEscrowStatus(escrowId, status, txHash = null, contractAddress = null) {
  await dataSource.initialize();
  
  const updateData = {
    status: status,
    updated_at: new Date()
  };
  
  if (txHash) updateData.transaction_hash = txHash;
  if (contractAddress) updateData.smart_contract_address = contractAddress;
  
  const query = `
    UPDATE escrows 
    SET ${Object.keys(updateData).map(key => `${key} = $${Object.keys(updateData).indexOf(key) + 2}`).join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  
  const values = [escrowId, ...Object.values(updateData)];
  
  try {
    const result = await dataSource.query(query, values);
    console.log('✅ Escrow updated:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error updating escrow:', error.message);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

async function processPayment84Custody() {
  console.log('🚀 Processing Payment 84 custody funding...');
  
  try {
    // Step 1: Get bridge wallet address from environment or config
    const bridgeWalletAddress = process.env.BRIDGE_WALLET_ADDRESS || '0x742d35cc6681c4c8e2d4c3b9e6a47b2a';
    
    // Step 2: Withdraw 5000 MXNB to bridge wallet
    const withdrawalResult = await createJunoWithdrawal(5000, bridgeWalletAddress);
    
    if (withdrawalResult.success) {
      const txHash = withdrawalResult.payload?.transaction_id || withdrawalResult.payload?.id;
      
      // Step 3: Update escrow status to "funding"
      await updateEscrowStatus(72, 'funding', txHash, null);
      
      console.log('🎉 Payment 84 custody funding initiated successfully!');
      console.log('Next steps:');
      console.log('1. Monitor withdrawal transaction on blockchain');
      console.log('2. Once confirmed, create smart contract escrow');
      console.log('3. Update escrow status to "active"');
      
    } else {
      throw new Error('Withdrawal creation failed');
    }
    
  } catch (error) {
    console.error('❌ Error processing payment 84 custody:', error.message);
    
    // Update escrow to error status
    try {
      await updateEscrowStatus(72, 'error', null, null);
    } catch (updateError) {
      console.error('❌ Error updating escrow to error status:', updateError.message);
    }
  }
}

// Run the script
processPayment84Custody().catch(console.error);
