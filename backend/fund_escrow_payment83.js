require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;
const ESCROW_ID = 3; // Payment 83 / Escrow 71 maps to Smart Contract Escrow ID 3

const ABI = [
  "function fundEscrow(uint256 escrowId) public",
  "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
];

async function fundEscrowPayment83() {
  console.log('🚀 Funding Escrow for Payment 83');
  console.log('================================');
  console.log(`Escrow Contract: ${ESCROW_CONTRACT}`);
  console.log(`Escrow ID: ${ESCROW_ID}`);
  
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(ESCROW_CONTRACT, ABI, signer);

  try {
    // Check escrow details before funding
    console.log('\n📋 Escrow details before funding:');
    const escrowBefore = await contract.escrows(ESCROW_ID);
    console.log(`Payer: ${escrowBefore[0]}`);
    console.log(`Payee: ${escrowBefore[1]}`);
    console.log(`Amount: ${ethers.utils.formatUnits(escrowBefore[2], 6)} MXNB`);
    console.log(`Status: ${escrowBefore[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    
    if (escrowBefore[6] !== 0) {
      console.log(`⚠️ Escrow is not in CREATED status. Current status: ${escrowBefore[6]}`);
      if (escrowBefore[6] === 1) {
        console.log('✅ Escrow is already FUNDED!');
        return;
      }
    }

    // Fund the escrow
    console.log(`\n💰 Calling fundEscrow(${ESCROW_ID})...`);
    const tx = await contract.fundEscrow(ESCROW_ID, { 
      gasLimit: 500_000,
      gasPrice: ethers.utils.parseUnits('0.1', 'gwei') // Low gas price for Arbitrum
    });
    
    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Check escrow status after funding
    console.log('\n📋 Escrow details after funding:');
    const escrowAfter = await contract.escrows(ESCROW_ID);
    console.log(`Status: ${escrowAfter[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    
    if (escrowAfter[6] === 1) {
      console.log('\n🎉 SUCCESS! Escrow is now FUNDED');
      console.log('✅ 1000 MXNB tokens are locked in the smart contract');
      console.log(`✅ Tokens will be released on: ${new Date(escrowAfter[3] * 1000).toISOString()}`);
      console.log(`✅ Transaction Hash: ${tx.hash}`);
      
      // TODO: Update database with funding transaction hash
      console.log('\n📝 Next Steps:');
      console.log('1. Update Payment 83 status to "active"');
      console.log('2. Log PaymentEvent for escrow funding');
      console.log('3. Update escrow funding_tx_hash in database');
      
    } else {
      console.log(`❌ Funding may have failed. Status: ${escrowAfter[6]}`);
    }

  } catch (error) {
    console.error('❌ Error funding escrow:', error.message);
    if (error.error && error.error.message) {
      console.error('Contract Error:', error.error.message);
    }
  }
}

fundEscrowPayment83();
