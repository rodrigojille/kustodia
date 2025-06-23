require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;
const SMART_CONTRACT_ESCROW_ID = 1; // Payment 81 Escrow ID

const ABI = [
  "function release(uint256 escrowId) public",
  "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
];

async function manualReleasePayment81() {
  console.log('🔓 MANUAL RELEASE - PAYMENT 81');
  console.log('=============================');
  console.log(`Smart Contract Escrow ID: ${SMART_CONTRACT_ESCROW_ID}`);
  console.log(`Escrow Contract: ${ESCROW_CONTRACT}`);
  console.log('');

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(ESCROW_CONTRACT, ABI, signer);

  try {
    // Check current status
    console.log('📋 Checking current escrow status...');
    const escrowDetails = await contract.escrows(SMART_CONTRACT_ESCROW_ID);
    console.log(`Payer: ${escrowDetails[0]}`);
    console.log(`Payee: ${escrowDetails[1]}`);
    console.log(`Amount: ${ethers.utils.formatUnits(escrowDetails[2], 6)} MXNB`);
    console.log(`Deadline: ${new Date(escrowDetails[3] * 1000).toISOString()}`);
    console.log(`Status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    console.log('');

    const now = Math.floor(Date.now() / 1000);
    const deadline = escrowDetails[3].toNumber();
    
    if (now < deadline) {
      console.log('❌ Custody period not yet ended');
      console.log(`Current: ${new Date(now * 1000).toISOString()}`);
      console.log(`Deadline: ${new Date(deadline * 1000).toISOString()}`);
      return;
    }

    if (escrowDetails[6] === 2) {
      console.log('✅ Escrow already released');
      return;
    }

    if (escrowDetails[6] !== 1) {
      console.log(`❌ Escrow not in FUNDED status. Current: ${escrowDetails[6]}`);
      return;
    }

    // Release the escrow
    console.log('🔓 Releasing escrow...');
    const tx = await contract.release(SMART_CONTRACT_ESCROW_ID, {
      gasLimit: 300_000,
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei')
    });

    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Check final status
    const finalDetails = await contract.escrows(SMART_CONTRACT_ESCROW_ID);
    console.log(`\n🎉 Final Status: ${finalDetails[6]} (should be 2 for Released)`);
    
    if (finalDetails[6] === 2) {
      console.log('✅ SUCCESS! Escrow successfully released');
      console.log(`✅ ${ethers.utils.formatUnits(escrowDetails[2], 6)} MXNB transferred back to Bridge Wallet`);
      console.log(`✅ Transaction Hash: ${tx.hash}`);
      console.log('\n📝 Next Steps:');
      console.log('1. Update database: escrow.release_tx_hash = transaction hash');
      console.log('2. Update escrow.status = "released"');
      console.log('3. Call Juno redemption API for MXNB → MXN conversion');
      console.log('4. Initiate SPEI payout to seller');
    } else {
      console.log(`❌ Release may have failed. Final status: ${finalDetails[6]}`);
    }

  } catch (error) {
    console.error('❌ Error releasing escrow:', error.message);
    if (error.error && error.error.message) {
      console.error('Contract Error:', error.error.message);
    }
  }
}

manualReleasePayment81();
