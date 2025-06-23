require('dotenv').config();
const { ethers } = require('ethers');

const ETH_RPC_URL = process.env.ETH_RPC_URL;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;

async function checkFundingStatus() {
  console.log('🔍 Checking Escrow Funding Status for Payment 83 / Escrow ID 3');
  console.log('===============================================================');
  
  const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
  
  // Check MXNB balances
  const mxnbContract = new ethers.Contract(MXNB_TOKEN, [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ], provider);
  
  // Check escrow contract status
  const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
    "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
  ], provider);
  
  try {
    const decimals = await mxnbContract.decimals();
    console.log(`MXNB Token Decimals: ${decimals}`);
    
    // Bridge wallet balance
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    console.log(`\n💰 Bridge Wallet Balance: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
    console.log(`Bridge Wallet Address: ${BRIDGE_WALLET}`);
    
    // Escrow contract balance
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    console.log(`\n🔒 Escrow Contract Balance: ${ethers.utils.formatUnits(escrowBalance, decimals)} MXNB`);
    console.log(`Escrow Contract Address: ${ESCROW_CONTRACT}`);
    
    // Check specific escrow details
    console.log(`\n📋 Escrow ID 3 Details:`);
    const escrowDetails = await escrowContract.escrows(3);
    console.log(`Payer: ${escrowDetails[0]}`);
    console.log(`Payee: ${escrowDetails[1]}`);
    console.log(`Amount: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
    console.log(`Deadline: ${new Date(escrowDetails[3] * 1000).toISOString()}`);
    console.log(`Status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    console.log(`Token: ${escrowDetails[8]}`);
    
    // Analysis
    console.log(`\n🎯 FUNDING ANALYSIS:`);
    if (escrowDetails[6] === 0) {
      console.log(`❌ Escrow Status: CREATED (not funded yet)`);
      console.log(`💡 Next Step: Call fundEscrow(3) to transfer MXNB from Bridge Wallet`);
      
      if (bridgeBalance.gte(escrowDetails[2])) {
        console.log(`✅ Bridge Wallet has sufficient balance to fund escrow`);
        console.log(`Required: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
        console.log(`Available: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
      } else {
        console.log(`❌ Bridge Wallet has insufficient balance`);
        console.log(`Required: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
        console.log(`Available: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
      }
    } else if (escrowDetails[6] === 1) {
      console.log(`✅ Escrow Status: FUNDED (tokens locked in escrow)`);
    } else {
      console.log(`ℹ️ Escrow Status: ${escrowDetails[6]} (see status mapping above)`);
    }
    
  } catch (error) {
    console.error('❌ Error checking funding status:', error.message);
  }
}

checkFundingStatus();
