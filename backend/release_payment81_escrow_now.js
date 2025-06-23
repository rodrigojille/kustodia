require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;

const ABI = [
  "function release(uint256 escrowId) public",
  "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)",
  "function getEscrowCount() view returns (uint256)"
];

const MXNB_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function releasePayment81EscrowNow() {
  console.log('🔓 RELEASING PAYMENT 81 ESCROW - IMMEDIATE ACTION');
  console.log('=================================================');
  console.log(`Escrow Contract: ${ESCROW_CONTRACT}`);
  console.log(`Bridge Wallet: ${BRIDGE_WALLET}`);
  console.log('');

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(ESCROW_CONTRACT, ABI, signer);
  const mxnbContract = new ethers.Contract(MXNB_TOKEN, MXNB_ABI, provider);

  try {
    const decimals = await mxnbContract.decimals();
    
    // Step 1: Check current balances
    console.log('💰 Step 1: Current MXNB Balances');
    const bridgeBalanceBefore = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalanceBefore = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log(`Bridge Wallet (Before): ${ethers.utils.formatUnits(bridgeBalanceBefore, decimals)} MXNB`);
    console.log(`Escrow Contract (Before): ${ethers.utils.formatUnits(escrowBalanceBefore, decimals)} MXNB`);
    console.log('');
    
    // Step 2: Check all escrows to find Payment 81's escrow
    console.log('📋 Step 2: Checking All Escrows');
    const escrowCount = await contract.getEscrowCount();
    console.log(`Total Escrows: ${escrowCount}`);
    
    let payment81EscrowId = null;
    let payment81Amount = null;
    
    for (let i = 1; i <= escrowCount.toNumber(); i++) {
      try {
        const escrowDetails = await contract.escrows(i);
        const amount = ethers.utils.formatUnits(escrowDetails[2], decimals);
        const status = escrowDetails[6];
        const statusText = ['Created', 'Funded', 'Released', 'Disputed'][status] || 'Unknown';
        
        console.log(`Escrow ${i}: ${amount} MXNB - Status: ${status} (${statusText})`);
        
        // Payment 81 should have 1000 MXNB and be in Funded status (1)
        if (parseFloat(amount) === 1000 && status === 1) {
          payment81EscrowId = i;
          payment81Amount = amount;
          console.log(`✅ Found Payment 81 Escrow: ID ${i} with ${amount} MXNB`);
        }
      } catch (error) {
        console.log(`Escrow ${i}: Error - ${error.message}`);
      }
    }
    
    if (!payment81EscrowId) {
      // Try escrow ID 1 specifically (from our previous analysis)
      console.log('');
      console.log('🔍 Checking Escrow ID 1 specifically (Payment 81):');
      const escrow1Details = await contract.escrows(1);
      const amount1 = ethers.utils.formatUnits(escrow1Details[2], decimals);
      const status1 = escrow1Details[6];
      const statusText1 = ['Created', 'Funded', 'Released', 'Disputed'][status1] || 'Unknown';
      
      console.log(`Escrow 1: ${amount1} MXNB - Status: ${status1} (${statusText1})`);
      
      if (status1 === 1) { // If it's funded
        payment81EscrowId = 1;
        payment81Amount = amount1;
        console.log(`✅ Using Escrow ID 1 for Payment 81: ${amount1} MXNB`);
      } else if (status1 === 2) {
        console.log('⚠️ Escrow 1 already shows as Released, but tokens might still be locked');
        console.log('🔄 Will attempt release anyway to ensure tokens are transferred');
        payment81EscrowId = 1;
        payment81Amount = amount1;
      }
    }
    
    if (!payment81EscrowId) {
      throw new Error('Could not identify Payment 81 escrow ID');
    }
    
    console.log('');
    console.log(`🎯 Target Escrow: ID ${payment81EscrowId} with ${payment81Amount} MXNB`);
    console.log('');
    
    // Step 3: Execute release
    console.log('🔓 Step 3: Executing Escrow Release');
    console.log(`Releasing Escrow ID: ${payment81EscrowId}`);
    
    const releaseTx = await contract.release(payment81EscrowId, {
      gasLimit: 300_000,
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei')
    });
    
    console.log(`⏳ Release Transaction: ${releaseTx.hash}`);
    console.log('Waiting for confirmation...');
    
    const receipt = await releaseTx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log('');
    
    // Step 4: Verify balances after release
    console.log('💰 Step 4: Verifying Balances After Release');
    const bridgeBalanceAfter = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalanceAfter = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log(`Bridge Wallet (After): ${ethers.utils.formatUnits(bridgeBalanceAfter, decimals)} MXNB`);
    console.log(`Escrow Contract (After): ${ethers.utils.formatUnits(escrowBalanceAfter, decimals)} MXNB`);
    
    const transferred = bridgeBalanceAfter.sub(bridgeBalanceBefore);
    const escrowReduced = escrowBalanceBefore.sub(escrowBalanceAfter);
    
    console.log(`✅ Transferred to Bridge: ${ethers.utils.formatUnits(transferred, decimals)} MXNB`);
    console.log(`✅ Reduced in Escrow: ${ethers.utils.formatUnits(escrowReduced, decimals)} MXNB`);
    
    // Step 5: Verify escrow status
    console.log('');
    console.log('📋 Step 5: Final Escrow Status');
    const finalEscrowDetails = await contract.escrows(payment81EscrowId);
    const finalStatus = finalEscrowDetails[6];
    const finalStatusText = ['Created', 'Funded', 'Released', 'Disputed'][finalStatus] || 'Unknown';
    
    console.log(`Escrow ${payment81EscrowId} Final Status: ${finalStatus} (${finalStatusText})`);
    
    if (finalStatus === 2 && transferred.gt(0)) {
      console.log('');
      console.log('🎉 PAYMENT 81 ESCROW RELEASE SUCCESSFUL!');
      console.log('========================================');
      console.log(`✅ Escrow ID: ${payment81EscrowId}`);
      console.log(`✅ Amount Released: ${ethers.utils.formatUnits(transferred, decimals)} MXNB`);
      console.log(`✅ Transaction Hash: ${releaseTx.hash}`);
      console.log(`✅ Bridge Wallet New Balance: ${ethers.utils.formatUnits(bridgeBalanceAfter, decimals)} MXNB`);
      console.log(`✅ Ready for MXNB redemption and payment completion`);
      
      return {
        success: true,
        escrowId: payment81EscrowId,
        amountReleased: ethers.utils.formatUnits(transferred, decimals),
        txHash: releaseTx.hash,
        newBridgeBalance: ethers.utils.formatUnits(bridgeBalanceAfter, decimals)
      };
    } else {
      throw new Error(`Release may have failed. Status: ${finalStatus}, Transferred: ${ethers.utils.formatUnits(transferred, decimals)}`);
    }
    
  } catch (error) {
    console.error('❌ Error releasing escrow:', error.message);
    if (error.error && error.error.message) {
      console.error('Contract Error:', error.error.message);
    }
    return { success: false, error: error.message };
  }
}

releasePayment81EscrowNow();
