const { ethers } = require('ethers');
require('dotenv').config();

async function testTransferFix() {
  try {
    console.log('🧪 Testing transfer fix with correct decimals...');
    
    const PROVIDER_URL = process.env.ETH_RPC_URL;
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
    const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
    const BRIDGE_WALLET_PK = process.env.ESCROW_PRIVATE_KEY;
    const JUNO_WALLET = process.env.JUNO_WALLET;
    
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
    const tokenContract = new ethers.Contract(
      MXNB_TOKEN, 
      ['function balanceOf(address) view returns (uint256)', 'function transfer(address to, uint256 amount) returns (bool)'], 
      wallet
    );
    
    // Check balance with correct decimals
    const balance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const balanceFormatted = ethers.formatUnits(balance, 6); // Correct decimals
    console.log(`💰 Bridge Balance (6 decimals): ${balanceFormatted} MXNB`);
    
    // Test amount: 30,000 MXNB with 6 decimals
    const testAmount = ethers.parseUnits('30000', 6);
    console.log(`📋 Test amount: 30,000 MXNB`);
    console.log(`📋 Test amount (raw): ${testAmount.toString()}`);
    
    // Check if we have enough balance
    if (balance >= testAmount) {
      console.log('✅ Sufficient balance for transfer!');
      
      // Try gas estimation
      try {
        const gasEstimate = await tokenContract.transfer.estimateGas(JUNO_WALLET, testAmount);
        console.log(`⛽ Gas estimate successful: ${gasEstimate.toString()}`);
        console.log('🎉 Transfer should work now!');
      } catch (gasError) {
        console.error('❌ Gas estimation still failed:', gasError.message);
      }
    } else {
      console.log('❌ Still insufficient balance');
      console.log(`   Required: ${ethers.formatUnits(testAmount, 6)} MXNB`);
      console.log(`   Available: ${balanceFormatted} MXNB`);
    }
    
  } catch (error) {
    console.error('❌ Error testing transfer fix:', error);
  }
}

testTransferFix();
