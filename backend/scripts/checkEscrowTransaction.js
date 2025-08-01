require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { DataSource } = require('typeorm');

// Database connection
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
    database: process.env.DB_NAME || 'kustodia',
    synchronize: false,
    logging: false,
    entities: ['../src/entities/*.ts'],
});

// Correct KustodiaEscrow2_0 ABI
const ESCROW_ABI = [
    "function createEscrow(address payer, address payee, address token, uint256 amount, uint256 deadline, string vertical, string clabe, string conditions) external returns (uint256)",
    "function fundEscrow(uint256 escrowId) external",
    "function getEscrow(uint256 escrowId) external view returns (tuple(address payer, address payee, address token, uint256 amount, uint256 deadline, string vertical, string clabe, string conditions, bool funded, bool released, uint256 createdAt))",
    "event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, string vertical)",
    "event EscrowFunded(uint256 indexed escrowId)"
];

async function checkTransaction() {
    try {
        console.log('🔍 Checking escrow creation transaction...');
        
        const txHash = '0xc4555b1be78a6116f45eddf044a2859a992782efc2820f2a83ef054f7cf794ba';
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
        const rpcUrl = process.env.ETH_RPC_URL;
        
        // Setup blockchain connection
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, provider);
        
        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        console.log('📄 Transaction receipt found');
        console.log('  - Status:', receipt.status === 1 ? 'Success' : 'Failed');
        console.log('  - Gas Used:', receipt.gasUsed.toString());
        console.log('  - Block Number:', receipt.blockNumber);
        
        if (receipt.status !== 1) {
            throw new Error('Transaction failed');
        }
        
        console.log('📋 Analyzing logs...');
        console.log('  - Total logs:', receipt.logs.length);
        
        let escrowId = null;
        let escrowCreatedFound = false;
        
        // Check each log
        for (let i = 0; i < receipt.logs.length; i++) {
            const log = receipt.logs[i];
            console.log(`  - Log ${i}:`, {
                address: log.address,
                topics: log.topics.length,
                data: log.data.length
            });
            
            try {
                // Try to parse with escrow contract interface
                const parsedLog = escrowContract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                
                if (parsedLog) {
                    console.log(`    ✅ Parsed as: ${parsedLog.name}`);
                    console.log(`    📊 Args:`, parsedLog.args);
                    
                    if (parsedLog.name === 'EscrowCreated') {
                        escrowId = parsedLog.args.escrowId.toString();
                        escrowCreatedFound = true;
                        console.log(`    🆔 Found Escrow ID: ${escrowId}`);
                        console.log(`    👤 Payer: ${parsedLog.args.payer}`);
                        console.log(`    👤 Payee: ${parsedLog.args.payee}`);
                        console.log(`    💰 Amount: ${parsedLog.args.amount.toString()}`);
                        console.log(`    🏷️ Vertical: ${parsedLog.args.vertical}`);
                    }
                }
            } catch (e) {
                console.log(`    ❌ Could not parse: ${e.message}`);
            }
        }
        
        if (!escrowCreatedFound) {
            console.log('⚠️ No EscrowCreated event found in logs');
            
            // Try alternative approach - check recent escrows
            console.log('🔍 Trying alternative approach - checking recent escrows...');
            
            // Get current block and check recent blocks for events
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = currentBlock - 100; // Check last 100 blocks
            
            const filter = escrowContract.filters.EscrowCreated();
            const events = await escrowContract.queryFilter(filter, fromBlock, currentBlock);
            
            console.log(`📅 Found ${events.length} EscrowCreated events in recent blocks`);
            
            // Find the event from our transaction
            for (const event of events) {
                if (event.transactionHash === txHash) {
                    escrowId = event.args.escrowId.toString();
                    console.log(`🎯 Found matching event! Escrow ID: ${escrowId}`);
                    break;
                }
            }
        }
        
        if (!escrowId) {
            throw new Error('Could not determine escrow ID from transaction');
        }
        
        console.log('✅ Escrow ID determined:', escrowId);
        
        // Verify escrow exists on-chain
        console.log('🔍 Verifying escrow on-chain...');
        const escrowData = await escrowContract.getEscrow(escrowId);
        console.log('📊 On-chain escrow data:');
        console.log('  - Payer:', escrowData[0]);
        console.log('  - Payee:', escrowData[1]);
        console.log('  - Token:', escrowData[2]);
        console.log('  - Amount:', ethers.formatUnits(escrowData[3], 6), 'MXNB');
        console.log('  - Deadline:', new Date(Number(escrowData[4]) * 1000).toISOString());
        console.log('  - Vertical:', escrowData[5]);
        console.log('  - CLABE:', escrowData[6]);
        console.log('  - Conditions:', escrowData[7]);
        console.log('  - Funded:', escrowData[8]);
        console.log('  - Released:', escrowData[9]);
        console.log('  - Created At:', new Date(Number(escrowData[10]) * 1000).toISOString());
        
        // Now fund the escrow if not already funded
        if (!escrowData[8]) {
            console.log('💰 Escrow not funded yet, funding now...');
            
            const privateKey = process.env.ESCROW_PRIVATE_KEY;
            const signer = new ethers.Wallet(privateKey, provider);
            const escrowContractSigned = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);
            
            const fundTx = await escrowContractSigned.fundEscrow(escrowId);
            console.log('⏳ Waiting for funding transaction...');
            const fundReceipt = await fundTx.wait();
            console.log('✅ Escrow funding confirmed:', fundReceipt.hash);
        } else {
            console.log('✅ Escrow already funded');
        }
        
        // Update database
        console.log('💾 Updating database...');
        await AppDataSource.initialize();
        
        await AppDataSource.query(`
            UPDATE escrow 
            SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
            WHERE payment_id = 141
        `, [escrowId, txHash]);
        
        await AppDataSource.query(`
            UPDATE payment 
            SET status = 'escrowed', updated_at = NOW()
            WHERE id = 141
        `, []);
        
        // Create payment event
        await AppDataSource.query(`
            INSERT INTO payment_event (payment_id, event_type, details, created_at, is_automatic)
            VALUES ($1, $2, $3, NOW(), $4)
        `, [
            141,
            'escrow_created',
            JSON.stringify({
                smart_contract_escrow_id: escrowId,
                custody_amount: '15000.00',
                creation_tx_hash: txHash,
                deadline: new Date(Number(escrowData[4]) * 1000).toISOString(),
                manual_completion: true,
                flow: 'Flow 1: Platform-managed custody'
            }),
            false
        ]);
        
        console.log('🎉 Payment 141 escrow creation completed successfully!');
        console.log('📊 Final Summary:');
        console.log('  - Payment ID: 141');
        console.log('  - Smart Contract Escrow ID:', escrowId);
        console.log('  - Creation Transaction:', txHash);
        console.log('  - Status: Active and Funded');
        console.log('  - Amount: 15,000 MXNB');
        console.log('  - Release Date:', new Date(Number(escrowData[4]) * 1000).toISOString());
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkTransaction().catch(console.error);
