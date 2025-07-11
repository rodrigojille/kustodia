const { ethers } = require('ethers');

async function checkTokenDecimals() {
  try {
    console.log('🔍 Checking MXNB token decimals...');
    
    // Use Arbitrum Sepolia RPC (since that's what the screenshot shows)
    const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc';
    const MOCK_ERC20_ADDRESS = process.env.MOCK_ERC20_ADDRESS || '0x82B9e52b26A2954E113F94Ff26647754d5a4247D';
    const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    const JUNO_WALLET = process.env.JUNO_WALLET || '0xb9cBEa875dCbb3eFd42D36c04cdD6C122eD0C7C9';
    
    console.log('🔍 Using Arbitrum Sepolia RPC:', RPC_URL);
    console.log('🔍 Token Address:', MOCK_ERC20_ADDRESS);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // ERC20 ABI for token info
    const erc20ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function totalSupply() view returns (uint256)"
    ];
    
    const tokenContract = new ethers.Contract(MOCK_ERC20_ADDRESS, erc20ABI, provider);
    
    // Get token info
    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    
    console.log(`\n📊 Token Information:`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Symbol: ${symbol}`);
    console.log(`  - Decimals: ${decimals}`);
    console.log(`  - Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
    
    // Check Bridge wallet balance
    const bridgeBalance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const bridgeBalanceFormatted = ethers.formatUnits(bridgeBalance, decimals);
    
    console.log(`\n💰 Bridge Wallet Balance: ${bridgeBalanceFormatted} ${symbol}`);
    console.log(`  - Raw balance: ${bridgeBalance.toString()}`);
    
    // Check Juno wallet balance  
    const junoBalance = await tokenContract.balanceOf(JUNO_WALLET);
    const junoBalanceFormatted = ethers.formatUnits(junoBalance, decimals);
    
    console.log(`💰 Juno Wallet Balance: ${junoBalanceFormatted} ${symbol}`);
    console.log(`  - Raw balance: ${junoBalance.toString()}`);
    
    // Check what 500 tokens would be in Wei with correct decimals
    const requiredAmount = ethers.parseUnits('500', decimals);
    const requiredAmountFormatted = ethers.formatUnits(requiredAmount, decimals);
    
    console.log(`\n🎯 Required for Payment 87: ${requiredAmountFormatted} ${symbol}`);
    console.log(`  - Raw amount: ${requiredAmount.toString()}`);
    
    // Check what we actually calculated with 18 decimals (wrong)
    const wrongCalculation = ethers.parseUnits('500', 18);
    console.log(`❌ Wrong calculation (18 decimals): ${wrongCalculation.toString()}`);
    console.log(`✅ Correct calculation (${decimals} decimals): ${requiredAmount.toString()}`);
    
    if (bridgeBalance >= requiredAmount) {
      console.log('\n✅ Bridge wallet has sufficient balance for escrow funding!');
    } else {
      const shortfall = requiredAmount - bridgeBalance;
      const shortfallFormatted = ethers.formatUnits(shortfall, decimals);
      console.log(`\n❌ Bridge wallet is short by: ${shortfallFormatted} ${symbol}`);
      
      if (junoBalance >= shortfall) {
        console.log('💡 Juno wallet has enough tokens to cover the shortfall');
        console.log('🔄 Recommendation: Transfer tokens from Juno wallet to Bridge wallet');
      } else {
        console.log('❌ Even Juno wallet doesn\'t have enough tokens');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking token info:', error.message);
    console.error(error.stack);
  }
}

checkTokenDecimals();
