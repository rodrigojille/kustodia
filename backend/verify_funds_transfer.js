require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;

async function verifyFundsTransfer() {
  console.log('🔍 VERIFYING FUNDS TRANSFER FROM ESCROW TO BRIDGE WALLET');
  console.log('======================================================');
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
    console.log(`MXNB Token Decimals: ${decimals}`);
    
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log('💰 CURRENT MXNB BALANCES:');
    console.log(`Bridge Wallet: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
    console.log(`Escrow Contract: ${ethers.utils.formatUnits(escrowBalance, decimals)} MXNB`);
    console.log('');
    
    // Check specific escrow status for Payment 81 (Escrow ID 1)
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
    ], provider);
    
    console.log('📋 PAYMENT 81 ESCROW STATUS (Smart Contract ID: 1):');
    const escrowDetails = await escrowContract.escrows(1);
    console.log(`Payer: ${escrowDetails[0]}`);
    console.log(`Payee: ${escrowDetails[1]}`);
    console.log(`Amount: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
    console.log(`Deadline: ${new Date(escrowDetails[3] * 1000).toISOString()}`);
    console.log(`Status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    console.log(`Token: ${escrowDetails[8]}`);
    console.log('');
    
    // Analysis
    console.log('🎯 TRANSFER ANALYSIS:');
    if (escrowDetails[6] === 2) {
      console.log('✅ Escrow Status: RELEASED');
      console.log('✅ Funds have been transferred back to Bridge Wallet');
      console.log(`✅ Released Amount: ${ethers.utils.formatUnits(escrowDetails[2], decimals)} MXNB`);
      
      // Check if Bridge Wallet has the expected balance
      const expectedMinBalance = ethers.utils.parseUnits('1000', decimals); // At least 1000 MXNB from this release
      if (bridgeBalance.gte(expectedMinBalance)) {
        console.log('✅ Bridge Wallet has sufficient balance for redemption');
        console.log(`✅ Available for redemption: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
      } else {
        console.log('❌ Bridge Wallet balance seems insufficient');
        console.log(`Expected minimum: ${ethers.utils.formatUnits(expectedMinBalance, decimals)} MXNB`);
        console.log(`Current balance: ${ethers.utils.formatUnits(bridgeBalance, decimals)} MXNB`);
      }
      
      return {
        success: true,
        escrowReleased: true,
        bridgeBalance: ethers.utils.formatUnits(bridgeBalance, decimals),
        releasedAmount: ethers.utils.formatUnits(escrowDetails[2], decimals)
      };
    } else {
      console.log(`❌ Escrow Status: ${escrowDetails[6]} (not released)`);
      console.log('❌ Funds still locked in escrow contract');
      
      return {
        success: false,
        escrowReleased: false,
        escrowStatus: escrowDetails[6].toString()
      };
    }
    
  } catch (error) {
    console.error('❌ Error verifying funds transfer:', error.message);
    return { success: false, error: error.message };
  }
}

verifyFundsTransfer().then(result => {
  console.log('\n📊 VERIFICATION RESULT:');
  console.log(JSON.stringify(result, null, 2));
});
