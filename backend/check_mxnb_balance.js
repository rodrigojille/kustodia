const { ethers } = require('ethers');
require('dotenv').config();

async function checkMXNBBalances() {
  try {
    console.log('🔍 Checking MXNB balances...');
    
    const PROVIDER_URL = process.env.ETH_RPC_URL;
    const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
    const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
    const JUNO_WALLET = process.env.JUNO_WALLET;
    
    console.log(`📋 Bridge Wallet: ${BRIDGE_WALLET}`);
    console.log(`📋 Juno Wallet: ${JUNO_WALLET}`);
    console.log(`📋 MXNB Token: ${MXNB_TOKEN}`);
    
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const tokenContract = new ethers.Contract(
      MXNB_TOKEN, 
      ['function balanceOf(address) view returns (uint256)'], 
      provider
    );
    
    // Check bridge wallet balance
    const bridgeBalance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const bridgeBalanceFormatted = ethers.formatUnits(bridgeBalance, 18);
    console.log(`💰 Bridge Wallet Balance: ${bridgeBalanceFormatted} MXNB`);
    
    // Check Juno wallet balance
    const junoBalance = await tokenContract.balanceOf(JUNO_WALLET);
    const junoBalanceFormatted = ethers.formatUnits(junoBalance, 18);
    console.log(`💰 Juno Wallet Balance: ${junoBalanceFormatted} MXNB`);
    
    // Check if we need to find where the 30,000 MXNB went
    if (parseFloat(bridgeBalanceFormatted) < 30000) {
      console.log('🚨 Bridge wallet has insufficient balance for Payment 90!');
      console.log('🔍 Need to trace where the escrow release funds went...');
      
      // Check the escrow release transaction
      const releaseTxHash = '0x636d426615560139516d8a6909792204134053af4829797956e4d797e2c2510';
      console.log(`📋 Checking escrow release transaction: ${releaseTxHash}`);
      
      const tx = await provider.getTransaction(releaseTxHash);
      const receipt = await provider.getTransactionReceipt(releaseTxHash);
      
      console.log('📄 Transaction details:');
      console.log(`  From: ${tx.from}`);
      console.log(`  To: ${tx.to}`);
      console.log(`  Value: ${ethers.formatEther(tx.value)} ETH`);
      console.log(`  Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      
      // Check logs for token transfers
      console.log('\n📋 Transaction logs:');
      receipt.logs.forEach((log, index) => {
        if (log.address.toLowerCase() === MXNB_TOKEN.toLowerCase()) {
          console.log(`  Log ${index}: MXNB Token Transfer`);
          console.log(`    Topics: ${log.topics}`);
          console.log(`    Data: ${log.data}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking MXNB balances:', error);
  }
}

checkMXNBBalances();
