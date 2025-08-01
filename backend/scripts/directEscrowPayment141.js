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

// Correct KustodiaEscrow2_0 ABI (from the actual contract)
const ESCROW_ABI = [
    "function createEscrow(address payer, address payee, address token, uint256 amount, uint256 deadline, string vertical, string clabe, string conditions) external returns (uint256)",
    "function fundEscrow(uint256 escrowId) external",
    "function releaseEscrow(uint256 escrowId) external",
    "function getEscrow(uint256 escrowId) external view returns (tuple(address payer, address payee, address token, uint256 amount, uint256 deadline, string vertical, string clabe, string conditions, bool funded, bool released, uint256 createdAt))",
    "event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount, string vertical)",
    "event EscrowFunded(uint256 indexed escrowId)",
    "event EscrowReleased(uint256 indexed escrowId)"
];

// ERC20 ABI for token operations
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];

async function directEscrowCreation() {
    try {
        console.log('🚀 Starting direct escrow creation for Payment 141...');
        
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Fetch Payment 141 data
        const paymentData = await AppDataSource.query(`
            SELECT p.id, p.status, p.amount, p.deposit_clabe, p.vertical_type,
                   e.id as escrow_id, e.status as escrow_status, e.custody_amount, 
                   e.custody_end, e.smart_contract_escrow_id
            FROM payment p
            LEFT JOIN escrow e ON p.escrow_id = e.id
            WHERE p.id = 141
        `);

        if (paymentData.length === 0) {
            throw new Error('Payment 141 not found');
        }

        const payment = paymentData[0];
        console.log('📋 Payment 141 details:');
        console.log('  - Status:', payment.status);
        console.log('  - Amount:', payment.amount, 'MXN');
        console.log('  - Custody Amount:', payment.custody_amount, 'MXN');
        console.log('  - Escrow Status:', payment.escrow_status);
        console.log('  - Smart Contract ID:', payment.smart_contract_escrow_id);

        // Check if escrow already exists
        if (payment.smart_contract_escrow_id) {
            console.log('⚠️ Escrow already has smart contract ID:', payment.smart_contract_escrow_id);
            console.log('✅ Payment 141 escrow appears to be already created!');
            return;
        }

        // Environment variables
        const tokenAddress = process.env.MXNB_CONTRACT_ADDRESS;
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
        const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
        const privateKey = process.env.ESCROW_PRIVATE_KEY;
        const rpcUrl = process.env.ETH_RPC_URL;
        
        console.log('🔗 Configuration:');
        console.log('  - Bridge wallet:', bridgeWallet);
        console.log('  - MXNB Token:', tokenAddress);
        console.log('  - Escrow Contract:', escrowAddress);
        console.log('  - RPC URL:', rpcUrl);

        // Setup blockchain connection
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(privateKey, provider);
        
        // Contract instances
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);

        // Check bridge wallet balance
        const balance = await tokenContract.balanceOf(bridgeWallet);
        const balanceFormatted = ethers.formatUnits(balance, 6);
        console.log('💰 Bridge wallet MXNB balance:', balanceFormatted, 'MXNB');

        if (parseFloat(balanceFormatted) < parseFloat(payment.custody_amount)) {
            throw new Error(`Insufficient balance. Need ${payment.custody_amount} MXNB, have ${balanceFormatted} MXNB`);
        }

        // Calculate deadline
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const custodyEndTimestamp = Math.floor(new Date(payment.custody_end).getTime() / 1000);
        
        let deadline;
        if (custodyEndTimestamp <= currentTimestamp) {
            const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
            deadline = Math.floor(futureDate.getTime() / 1000);
            console.log('⏰ Original deadline passed, setting new deadline:', futureDate.toISOString());
        } else {
            deadline = custodyEndTimestamp;
            console.log('⏰ Using original deadline:', new Date(deadline * 1000).toISOString());
        }

        // Convert amount to token units (6 decimals for MXNB)
        const amountInTokenUnits = ethers.parseUnits(payment.custody_amount.toString(), 6);
        console.log('💱 Amount conversion:', payment.custody_amount, 'MXN →', amountInTokenUnits.toString(), 'token units');

        // Check and approve token allowance
        const currentAllowance = await tokenContract.allowance(bridgeWallet, escrowAddress);
        console.log('🔍 Current allowance:', ethers.formatUnits(currentAllowance, 6), 'MXNB');

        if (currentAllowance < amountInTokenUnits) {
            console.log('📝 Approving token spending...');
            
            // Reset allowance to 0 first if it's not 0 (some tokens require this)
            if (currentAllowance > BigInt(0)) {
                const resetTx = await tokenContract.approve(escrowAddress, 0);
                await resetTx.wait();
                console.log('✅ Allowance reset to 0');
            }
            
            // Set new allowance
            const approveTx = await tokenContract.approve(escrowAddress, amountInTokenUnits);
            await approveTx.wait();
            console.log('✅ Token spending approved');
        } else {
            console.log('✅ Sufficient allowance already exists');
        }

        // Create escrow on-chain
        console.log('🔨 Creating escrow on blockchain...');
        const createTx = await escrowContract.createEscrow(
            bridgeWallet, // payer
            bridgeWallet, // payee (Flow 1: platform-managed custody)
            tokenAddress, // token
            amountInTokenUnits, // amount
            deadline, // deadline
            payment.vertical_type || '', // vertical
            payment.deposit_clabe || '', // clabe
            'Flow 1: Platform-managed custody - Payment 141 manual completion' // conditions
        );

        console.log('⏳ Waiting for escrow creation transaction...');
        const createReceipt = await createTx.wait();
        console.log('✅ Escrow creation transaction confirmed:', createReceipt.hash);

        // Parse logs to get escrow ID
        let escrowId = null;
        for (const log of createReceipt.logs) {
            try {
                const parsedLog = escrowContract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'EscrowCreated') {
                    escrowId = parsedLog.args.escrowId.toString();
                    console.log('🆔 Escrow ID from event:', escrowId);
                    break;
                }
            } catch (e) {
                // Skip logs that don't match our interface
            }
        }

        if (!escrowId) {
            throw new Error('Failed to extract escrow ID from transaction logs');
        }

        // Fund the escrow
        console.log('💰 Funding escrow...');
        const fundTx = await escrowContract.fundEscrow(escrowId);
        console.log('⏳ Waiting for funding transaction...');
        const fundReceipt = await fundTx.wait();
        console.log('✅ Escrow funding transaction confirmed:', fundReceipt.hash);

        // Update database
        console.log('💾 Updating database...');
        
        await AppDataSource.query(`
            UPDATE escrow 
            SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
            WHERE id = $3
        `, [escrowId, createReceipt.hash, payment.escrow_id]);

        await AppDataSource.query(`
            UPDATE payment 
            SET status = 'escrowed', updated_at = NOW()
            WHERE id = $1
        `, [payment.id]);

        // Create payment event
        await AppDataSource.query(`
            INSERT INTO payment_event (payment_id, event_type, details, created_at, is_automatic)
            VALUES ($1, $2, $3, NOW(), $4)
        `, [
            payment.id,
            'escrow_created',
            JSON.stringify({
                escrow_id: payment.escrow_id,
                smart_contract_escrow_id: escrowId,
                custody_amount: payment.custody_amount,
                creation_tx_hash: createReceipt.hash,
                funding_tx_hash: fundReceipt.hash,
                deadline: new Date(deadline * 1000).toISOString(),
                manual_completion: true,
                flow: 'Flow 1: Platform-managed custody'
            }),
            false
        ]);

        console.log('🎉 Escrow creation and funding completed successfully!');
        console.log('📊 Summary:');
        console.log('  - Payment ID:', payment.id);
        console.log('  - Escrow ID:', payment.escrow_id);
        console.log('  - Smart Contract Escrow ID:', escrowId);
        console.log('  - Custody Amount:', payment.custody_amount, 'MXNB');
        console.log('  - Creation Transaction:', createReceipt.hash);
        console.log('  - Funding Transaction:', fundReceipt.hash);
        console.log('  - Release Date:', new Date(deadline * 1000).toISOString());

        // Verify final state
        const finalCheck = await AppDataSource.query(`
            SELECT p.id, p.status, e.status as escrow_status, e.smart_contract_escrow_id, e.custody_end, e.blockchain_tx_hash
            FROM payment p 
            JOIN escrow e ON p.escrow_id = e.id 
            WHERE p.id = $1
        `, [payment.id]);
        
        console.log('🔍 Final state:', finalCheck[0]);
        console.log('\n✅ Payment 141 escrow is now active and ready for release!');

    } catch (error) {
        console.error('❌ Error creating escrow:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.reason) {
            console.error('Error reason:', error.reason);
        }
        if (error.transaction) {
            console.error('Failed transaction:', error.transaction);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
directEscrowCreation().catch(console.error);
