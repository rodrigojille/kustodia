const { ethers } = require('ethers');
const mysql = require('mysql2/promise');

// Configuration
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3';
const ESCROW_CONTRACT_ADDRESS = '0xEcfd7d23488Fb05834f6dD0390CD2E158a0B5d15';
const MXNB_TOKEN_ADDRESS = '0x82B9E52b26a2954E113f94Ff26647754d5a4247D';
const BRIDGE_WALLET_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

// Database config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '140290',
  database: process.env.DB_NAME || 'kustodia_local'
};

// Contract ABIs
const ESCROW_ABI = [
  "function escrows(uint256) view returns (address payer, address payee, address token, uint256 amount, uint256 deadline, bool buyerApproved, bool sellerApproved, bool released, string vertical, string clabe, string conditions)",
  "function fundEscrow(uint256 escrowId) external",
  "function release(uint256 escrowId) external",
  "event EscrowFunded(uint256 indexed escrowId, uint256 amount)"
];

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function checkEscrow9() {
  console.log('🔍 Checking Escrow #9 Funding Status...\n');

  // Connect to blockchain
  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
  const signer = new ethers.Wallet(BRIDGE_WALLET_PRIVATE_KEY, provider);
  const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
  const tokenContract = new ethers.Contract(MXNB_TOKEN_ADDRESS, TOKEN_ABI, signer);

  console.log('Bridge Wallet Address:', signer.address);

  // Check escrow details
  const escrowData = await escrowContract.escrows(9);
  console.log('\n📋 Smart Contract Escrow #9 Details:');
  console.log('   Payer:', escrowData.payer);
  console.log('   Payee:', escrowData.payee);
  console.log('   Token:', escrowData.token);
  console.log('   Amount:', ethers.formatUnits(escrowData.amount, 6), 'MXNB');
  console.log('   Buyer Approved:', escrowData.buyerApproved);
  console.log('   Seller Approved:', escrowData.sellerApproved);
  console.log('   Released:', escrowData.released);

  // Check if escrow is funded
  const escrowAmount = escrowData.amount;
  const isFunded = escrowAmount > 0n;

  // Get payment details from database
  const pool = await mysql.createPool(dbConfig);
  const [payments] = await pool.execute(`
    SELECT p.*, e.smart_contract_escrow_id 
    FROM payment p 
    JOIN escrow e ON p.escrow_id = e.id 
    WHERE p.id = 112
  `);
  
  if (payments.length > 0) {
    const payment = payments[0];
    console.log('\n💳 Database Payment #112 Details:');
    console.log('   Amount:', payment.amount, 'MXN');
    console.log('   Database Escrow ID:', payment.escrow_id);
    console.log('   Smart Contract Escrow ID:', payment.smart_contract_escrow_id);
    console.log('   Payer Approval:', payment.payer_approval);
    console.log('   Payee Approval:', payment.payee_approval);
  }

  if (!isFunded) {
    console.log('\n❌ Escrow #9 is NOT funded (0 MXNB)');
    
    // Check bridge wallet balance
    const bridgeBalance = await tokenContract.balanceOf(signer.address);
    console.log('\n💰 Bridge Wallet MXNB Balance:', ethers.formatUnits(bridgeBalance, 6));

    if (payments.length > 0) {
      const paymentAmount = payments[0].amount;
      const amountInTokenUnits = ethers.parseUnits(paymentAmount.toString(), 6);
      
      console.log('\n💵 Required MXNB for Payment #112:', ethers.formatUnits(amountInTokenUnits, 6));
      
      if (bridgeBalance >= amountInTokenUnits) {
        console.log('\n✅ Bridge wallet has sufficient balance');
        console.log('\n⚠️  To fund the escrow, the automation should have called fundEscrow(9)');
        console.log('    This step seems to have been missed or failed during escrow creation.');
      } else {
        console.log('\n❌ Insufficient balance in bridge wallet');
        console.log('   Needed:', ethers.formatUnits(amountInTokenUnits, 6), 'MXNB');
        console.log('   Available:', ethers.formatUnits(bridgeBalance, 6), 'MXNB');
      }
    }
  } else {
    console.log('\n✅ Escrow #9 is funded with', ethers.formatUnits(escrowAmount, 6), 'MXNB');
    
    if (escrowData.buyerApproved && escrowData.sellerApproved && !escrowData.released) {
      console.log('\n🚀 Both parties approved on-chain, escrow can be released!');
    }
  }

  await pool.end();

  console.log('\n📊 Summary:');
  console.log('   - Smart Contract Escrow ID: 9');
  console.log('   - Database Escrow ID: 99');
  console.log('   - Funded:', isFunded ? 'Yes' : 'No');
  console.log('   - Can be released:', isFunded && !escrowData.released ? 'Yes' : 'No');
  
  if (!isFunded) {
    console.log('\n💡 Next Steps:');
    console.log('   1. The escrow needs to be funded with MXNB tokens');
    console.log('   2. This should have happened during escrow creation');
    console.log('   3. The automation needs to call fundEscrow(9) on the smart contract');
  }
}

checkEscrow9().catch(console.error);
