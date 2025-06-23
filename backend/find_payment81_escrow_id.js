require('dotenv').config();
const { Client } = require('pg');
const { ethers } = require('ethers');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const RPC_URL = process.env.ETH_RPC_URL;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2;

async function findPayment81EscrowId() {
  await client.connect();
  console.log('🔍 FINDING PAYMENT 81 SMART CONTRACT ESCROW ID');
  console.log('=============================================');

  try {
    // Get the blockchain transaction hash from database
    const escrowQuery = await client.query(`
      SELECT e.*, p.amount, p.recipient_email 
      FROM escrow e 
      JOIN payment p ON e.payment_id = p.id 
      WHERE e.payment_id = 81
    `);

    if (escrowQuery.rows.length === 0) {
      console.log('❌ No escrow found for Payment 81');
      return;
    }

    const escrow = escrowQuery.rows[0];
    console.log('✅ Database Escrow Record:');
    console.log(`Escrow ID: ${escrow.id}`);
    console.log(`Status: ${escrow.status}`);
    console.log(`Blockchain TX Hash: ${escrow.blockchain_tx_hash}`);
    console.log(`Smart Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
    console.log('');

    if (!escrow.blockchain_tx_hash) {
      console.log('❌ No blockchain transaction hash found');
      return;
    }

    // Clean up the transaction hash (remove any extra characters)
    let txHash = escrow.blockchain_tx_hash.trim();
    if (!txHash.startsWith('0x')) {
      txHash = '0x' + txHash;
    }
    
    console.log(`🔍 Analyzing transaction: ${txHash}`);
    
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log('❌ Transaction receipt not found');
      return;
    }

    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Decode EscrowCreated event
    const escrowContract = new ethers.Contract(ESCROW_CONTRACT, [
      "event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, uint256 deadline)"
    ], provider);

    const escrowCreatedTopic = escrowContract.interface.getEventTopic('EscrowCreated');
    
    for (const log of receipt.logs) {
      if (log.topics[0] === escrowCreatedTopic && log.address.toLowerCase() === ESCROW_CONTRACT.toLowerCase()) {
        const decoded = escrowContract.interface.parseLog(log);
        const smartContractEscrowId = decoded.args.escrowId.toString();
        
        console.log(`✅ Found Smart Contract Escrow ID: ${smartContractEscrowId}`);
        console.log(`Payer: ${decoded.args.payer}`);
        console.log(`Payee: ${decoded.args.payee}`);
        console.log(`Amount: ${ethers.utils.formatUnits(decoded.args.amount, 6)} MXNB`);
        console.log(`Deadline: ${new Date(decoded.args.deadline * 1000).toISOString()}`);
        
        // Update database if smart_contract_escrow_id is missing
        if (!escrow.smart_contract_escrow_id) {
          console.log(`\n📝 Updating database with Smart Contract Escrow ID: ${smartContractEscrowId}`);
          await client.query(
            'UPDATE escrow SET smart_contract_escrow_id = $1 WHERE id = $2',
            [smartContractEscrowId, escrow.id]
          );
          console.log('✅ Database updated');
        }
        
        await client.end();
        return smartContractEscrowId;
      }
    }
    
    console.log('❌ EscrowCreated event not found in transaction logs');
    
  } catch (error) {
    console.error('❌ Error finding escrow ID:', error.message);
  }
  
  await client.end();
}

findPayment81EscrowId();
