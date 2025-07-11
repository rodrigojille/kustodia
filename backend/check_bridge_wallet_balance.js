const { ethers } = require('ethers');

async function checkBridgeWalletBalance() {
  try {
    console.log('🔍 Checking bridge wallet MXNB balance...');
    
    // Environment variables
    const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    const MOCK_ERC20_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
    const JUNO_WALLET = process.env.JUNO_WALLET;
    const RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
    
    console.log('🔍 Environment check:');
    console.log(`  - Bridge Wallet: ${BRIDGE_WALLET}`);
    console.log(`  - Token Address: ${MOCK_ERC20_ADDRESS}`);
    console.log(`  - Juno Wallet: ${JUNO_WALLET}`);
    console.log(`  - RPC URL: ${RPC_URL}`);

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // ERC20 ABI for balance checking
    const erc20ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function transfer(address to, uint256 amount) returns (bool)"
    ];
    
    const tokenContract = new ethers.Contract(MOCK_ERC20_ADDRESS, erc20ABI, provider);
    
    // Get token info
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    
    console.log(`\n📊 Token Info: ${symbol} (${decimals} decimals)`);
    
    // Check Bridge wallet balance
    const bridgeBalance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const bridgeBalanceFormatted = ethers.formatUnits(bridgeBalance, decimals);
    
    console.log(`\n💰 Bridge Wallet Balance: ${bridgeBalanceFormatted} ${symbol}`);
    
    // Check Juno wallet balance
    const junoBalance = await tokenContract.balanceOf(JUNO_WALLET);
    const junoBalanceFormatted = ethers.formatUnits(junoBalance, decimals);
    
    console.log(`💰 Juno Wallet Balance: ${junoBalanceFormatted} ${symbol}`);
    
    // Check required amount (500 MXNB)
    const requiredAmount = ethers.parseUnits('500', decimals);
    const requiredAmountFormatted = ethers.formatUnits(requiredAmount, decimals);
    
    console.log(`\n🎯 Required for Payment 87: ${requiredAmountFormatted} ${symbol}`);
    
    if (bridgeBalance >= requiredAmount) {
      console.log('✅ Bridge wallet has sufficient balance for escrow funding!');
    } else {
      const shortfall = requiredAmount - bridgeBalance;
      const shortfallFormatted = ethers.formatUnits(shortfall, decimals);
      console.log(`❌ Bridge wallet is short by: ${shortfallFormatted} ${symbol}`);
      
      if (junoBalance >= shortfall) {
        console.log('💡 Juno wallet has enough tokens to cover the shortfall');
        console.log('🔄 Recommendation: Transfer tokens from Juno wallet to Bridge wallet');
      } else {
        console.log('❌ Even Juno wallet doesn\'t have enough tokens');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking balances:', error.message);
  }
}

checkBridgeWalletBalance();
