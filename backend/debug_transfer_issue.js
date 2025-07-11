const { ethers } = require('ethers');
require('dotenv').config();

async function debugTransferIssue() {
  try {
    console.log('🔍 Debugging bridge to Juno transfer issue...');
    
    const PROVIDER_URL = process.env.ETH_RPC_URL;
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
    const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
    const BRIDGE_WALLET_PK = process.env.ESCROW_PRIVATE_KEY;
    const JUNO_WALLET = process.env.JUNO_WALLET;
    
    console.log(`📋 Bridge Wallet: ${BRIDGE_WALLET}`);
    console.log(`📋 Juno Wallet: ${JUNO_WALLET}`);
    console.log(`📋 MXNB Token: ${MXNB_TOKEN}`);
    console.log(`📋 Bridge PK Set: ${BRIDGE_WALLET_PK ? 'Yes' : 'No'}`);
    
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
    
    console.log(`📋 Wallet Address from PK: ${wallet.address}`);
    console.log(`📋 Addresses Match: ${wallet.address.toLowerCase() === BRIDGE_WALLET.toLowerCase()}`);
    
    const tokenContract = new ethers.Contract(
      MXNB_TOKEN, 
      ['function balanceOf(address) view returns (uint256)', 'function transfer(address to, uint256 amount) returns (bool)'], 
      wallet
    );
    
    // Check actual balance
    const balance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const balanceFormatted = ethers.formatUnits(balance, 18);
    console.log(`💰 Actual Bridge Balance: ${balanceFormatted} MXNB`);
    
    // Check if Juno wallet address is valid
    if (!ethers.isAddress(JUNO_WALLET)) {
      console.log('❌ Invalid Juno wallet address!');
      return;
    }
    
    // Try a small test transfer first (1 MXNB)
    const testAmount = ethers.parseUnits('1', 18);
    console.log(`🧪 Testing transfer of 1 MXNB to Juno wallet...`);
    
    try {
      // Estimate gas first
      const gasEstimate = await tokenContract.transfer.estimateGas(JUNO_WALLET, testAmount);
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      
      // Get gas price
      const gasPrice = await provider.getFeeData();
      console.log(`⛽ Gas price: ${gasPrice.gasPrice?.toString()}`);
      
      // Check ETH balance for gas
      const ethBalance = await provider.getBalance(BRIDGE_WALLET);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);
      console.log(`💰 ETH Balance for gas: ${ethBalanceFormatted} ETH`);
      
      if (parseFloat(ethBalanceFormatted) < 0.001) {
        console.log('❌ Insufficient ETH balance for gas fees!');
        return;
      }
      
      console.log('✅ All checks passed. Ready for transfer.');
      
    } catch (error) {
      console.error('❌ Gas estimation failed:', error.message);
      
      // Check if it's a revert reason
      if (error.message.includes('ERC20: transfer amount exceeds balance')) {
        console.log('🔍 Token contract says balance exceeded. Checking token decimals...');
        
        // Check token decimals
        const decimalsContract = new ethers.Contract(
          MXNB_TOKEN, 
          ['function decimals() view returns (uint8)'], 
          provider
        );
        
        try {
          const decimals = await decimalsContract.decimals();
          console.log(`📋 Token decimals: ${decimals}`);
          
          const correctBalance = ethers.formatUnits(balance, decimals);
          console.log(`💰 Correct balance with decimals: ${correctBalance} MXNB`);
        } catch (decError) {
          console.log('❌ Could not get token decimals:', decError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging transfer:', error);
  }
}

debugTransferIssue();
