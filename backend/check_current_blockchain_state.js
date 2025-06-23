require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;

async function checkCurrentBlockchainState() {
  console.log('🔗 CHECKING CURRENT BLOCKCHAIN STATE');
  console.log('===================================');
  console.log(`Bridge Wallet: ${BRIDGE_WALLET}`);
  console.log(`Escrow Contract: ${ESCROW_CONTRACT}`);
  console.log(`MXNB Token: ${MXNB_TOKEN}`);
  console.log('');

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  try {
    // Check MXNB balances
    const mxnbContract = new ethers.Contract(MXNB_TOKEN, [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ], provider);
    
    const decimals = await mxnbContract.decimals();
    console.log(`MXNB Decimals: ${decimals}`);
    
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log('💰 CURRENT MXNB BALANCES:');
    console.log(`Bridge Wallet: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
    console.log(`Escrow Contract: ${ethers.utils.formatUnits(escrowBalance, decimals)} MXNB`);
    console.log('');
    
    // Check specific escrow statuses
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)",
      "function getEscrowCount() view returns (uint256)"
    ], provider);
    
    // Check escrow count
    const escrowCount = await escrowContract.getEscrowCount();
    console.log(`📋 TOTAL ESCROWS IN CONTRACT: ${escrowCount}`);
    console.log('');
    
    // Check first few escrows
    console.log('📊 ESCROW DETAILS:');
    for (let i = 1; i <= Math.min(5, escrowCount.toNumber()); i++) {
      try {
        const escrowDetails = await escrowContract.escrows(i);
        const amount = ethers.utils.formatUnits(escrowDetails[2], decimals);
        const status = escrowDetails[6];
        const statusText = ['Created', 'Funded', 'Released', 'Disputed'][status] || 'Unknown';
        
        console.log(`Escrow ${i}:`);
        console.log(`  Amount: ${amount} MXNB`);
        console.log(`  Status: ${status} (${statusText})`);
        console.log(`  Payer: ${escrowDetails[0]}`);
        console.log(`  Payee: ${escrowDetails[1]}`);
        console.log(`  Deadline: ${new Date(escrowDetails[3] * 1000).toISOString()}`);
        console.log('');
      } catch (error) {
        console.log(`Escrow ${i}: Error reading details - ${error.message}`);
      }
    }
    
    // Analysis
    console.log('🎯 ANALYSIS:');
    const bridgeBalanceNum = parseFloat(ethers.utils.formatUnits(bridgeBalance, decimals));
    const escrowBalanceNum = parseFloat(ethers.utils.formatUnits(escrowBalance, decimals));
    
    console.log(`Bridge Wallet has: ${bridgeBalanceNum} MXNB`);
    console.log(`Escrow Contract has: ${escrowBalanceNum} MXNB`);
    
    if (escrowBalanceNum > 0) {
      console.log('⚠️ ISSUE: Escrow contract still holds MXNB tokens');
      console.log('❌ Need to release escrow funds to Bridge Wallet');
    } else {
      console.log('✅ No tokens locked in escrow contract');
    }
    
    return {
      bridgeBalance: bridgeBalanceNum,
      escrowBalance: escrowBalanceNum,
      escrowCount: escrowCount.toNumber(),
      needsRelease: escrowBalanceNum > 0
    };
    
  } catch (error) {
    console.error('❌ Error checking blockchain state:', error.message);
    return { error: error.message };
  }
}

checkCurrentBlockchainState();
