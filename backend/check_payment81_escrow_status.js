require('dotenv').config();
const { ethers } = require('ethers');

const RPC_URL = process.env.ETH_RPC_URL;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS;
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET;

// From database analysis, Payment 81 -> Escrow 69 -> Smart Contract Escrow ID needs to be determined
const ESCROW_CREATION_TX = '0x605519dbd29bafdab81933238c49978c2c1cdbc041ff2b1b235e243cf0ed6112';

async function checkPayment81EscrowStatus() {
  console.log('🔍 CHECKING PAYMENT 81 ESCROW STATUS ON BLOCKCHAIN');
  console.log('=================================================');
  console.log(`Escrow Contract: ${ESCROW_CONTRACT}`);
  console.log(`MXNB Token: ${MXNB_TOKEN}`);
  console.log(`Bridge Wallet: ${BRIDGE_WALLET}`);
  console.log(`Creation TX: ${ESCROW_CREATION_TX}`);
  console.log('');

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  
  try {
    // Get transaction receipt to find the escrow ID
    console.log('🔍 Getting transaction receipt...');
    const receipt = await provider.getTransactionReceipt(ESCROW_CREATION_TX);
    
    if (!receipt) {
      console.log('❌ Transaction receipt not found');
      return;
    }
    
    console.log(`✅ Transaction found in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    
    // Decode logs to find EscrowCreated event
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, uint256 deadline)",
      "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
    ], provider);
    
    const escrowCreatedTopic = escrowContract.interface.getEventTopic('EscrowCreated');
    console.log(`\n🔍 Looking for EscrowCreated events...`);
    
    let escrowId = null;
    for (const log of receipt.logs) {
      if (log.topics[0] === escrowCreatedTopic && log.address.toLowerCase() === ESCROW_CONTRACT.toLowerCase()) {
        const decoded = escrowContract.interface.parseLog(log);
        escrowId = decoded.args.escrowId.toString();
        console.log(`✅ Found EscrowCreated event: Escrow ID ${escrowId}`);
        console.log(`Payer: ${decoded.args.payer}`);
        console.log(`Payee: ${decoded.args.payee}`);
        console.log(`Amount: ${ethers.utils.formatUnits(decoded.args.amount, 6)} MXNB`);
        console.log(`Deadline: ${new Date(decoded.args.deadline * 1000).toISOString()}`);
        break;
      }
    }
    
    if (!escrowId) {
      console.log('❌ EscrowCreated event not found in transaction logs');
      return;
    }
    
    // Get current escrow state
    console.log(`\n📋 Current Escrow State (ID ${escrowId}):`);
    const escrowDetails = await escrowContract.escrows(escrowId);
    console.log(`Payer: ${escrowDetails[0]}`);
    console.log(`Payee: ${escrowDetails[1]}`);
    console.log(`Amount: ${ethers.utils.formatUnits(escrowDetails[2], 6)} MXNB`);
    console.log(`Deadline: ${new Date(escrowDetails[3] * 1000).toISOString()}`);
    console.log(`Status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    console.log(`Token: ${escrowDetails[8]}`);
    
    // Check MXNB balances
    const mxnbContract = new ethers.Contract(MXNB_TOKEN, [
      "function balanceOf(address) view returns (uint256)"
    ], provider);
    
    const bridgeBalance = await mxnbContract.balanceOf(BRIDGE_WALLET);
    const escrowBalance = await mxnbContract.balanceOf(ESCROW_CONTRACT);
    
    console.log(`\n💰 MXNB Balances:`);
    console.log(`Bridge Wallet: ${ethers.utils.formatUnits(bridgeBalance, 6)} MXNB`);
    console.log(`Escrow Contract: ${ethers.utils.formatUnits(escrowBalance, 6)} MXNB`);
    
    // Analysis and recommendations
    console.log(`\n🎯 RELEASE FLOW ANALYSIS:`);
    const now = Math.floor(Date.now() / 1000);
    const deadline = escrowDetails[3].toNumber();
    const canRelease = now >= deadline;
    
    console.log(`Current Time: ${new Date(now * 1000).toISOString()}`);
    console.log(`Deadline: ${new Date(deadline * 1000).toISOString()}`);
    console.log(`Can Release: ${canRelease ? '✅ YES' : '❌ NO'}`);
    
    if (escrowDetails[6] === 0) {
      console.log(`\n❌ Escrow is CREATED but NOT FUNDED`);
      console.log(`📝 Action needed: Call fundEscrow(${escrowId}) first`);
    } else if (escrowDetails[6] === 1) {
      console.log(`\n✅ Escrow is FUNDED`);
      if (canRelease) {
        console.log(`🎯 READY FOR RELEASE FLOW:`);
        console.log(`1. Call release(${escrowId}) to release custody`);
        console.log(`2. MXNB tokens will be transferred back to Bridge Wallet`);
        console.log(`3. Call Juno API to redeem MXNB → MXN`);
        console.log(`4. Trigger SPEI payout to seller`);
        console.log(`\nEstimated Smart Contract Escrow ID: ${escrowId}`);
      } else {
        const timeLeft = deadline - now;
        const hoursLeft = Math.floor(timeLeft / 3600);
        console.log(`⏳ Time remaining: ${hoursLeft} hours`);
      }
    } else if (escrowDetails[6] === 2) {
      console.log(`\n✅ Escrow is already RELEASED`);
      console.log(`📝 Proceed with MXNB redemption and SPEI payout`);
    } else {
      console.log(`\n⚠️ Escrow status: ${escrowDetails[6]}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking escrow status:', error.message);
  }
}

checkPayment81EscrowStatus();
