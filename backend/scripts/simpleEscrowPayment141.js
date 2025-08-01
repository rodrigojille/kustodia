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

async function completeEscrowPayment141() {
    try {
        console.log('🚀 Starting simple escrow creation for Payment 141...');
        
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

        if (payment.smart_contract_escrow_id) {
            console.log('✅ Escrow already has smart contract ID:', payment.smart_contract_escrow_id);
            console.log('🔍 Checking if we need to update status...');
            
            if (payment.escrow_status !== 'active') {
                await AppDataSource.query(`
                    UPDATE escrow 
                    SET status = 'active', updated_at = NOW()
                    WHERE id = $1
                `, [payment.escrow_id]);
                console.log('✅ Updated escrow status to active');
            }
            
            if (payment.status !== 'escrowed') {
                await AppDataSource.query(`
                    UPDATE payment 
                    SET status = 'escrowed', updated_at = NOW()
                    WHERE id = $1
                `, [payment.id]);
                console.log('✅ Updated payment status to escrowed');
            }
            
            console.log('🎉 Payment 141 escrow is already complete!');
            return;
        }

        // Setup blockchain connection
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const bridgeWallet = new ethers.Wallet(process.env.ESCROW_PRIVATE_KEY, provider);
        
        console.log('🔗 Bridge wallet address:', bridgeWallet.address);

        // Check MXNB balance
        const mxnbContract = new ethers.Contract(
            process.env.MXNB_CONTRACT_SEPOLIA,
            [
                'function balanceOf(address) view returns (uint256)',
                'function decimals() view returns (uint8)',
                'function approve(address spender, uint256 amount) returns (bool)'
            ],
            bridgeWallet
        );

        const balance = await mxnbContract.balanceOf(bridgeWallet.address);
        const decimals = await mxnbContract.decimals();
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        console.log('💰 Bridge wallet MXNB balance:', balanceFormatted);

        console.log('📊 Custody amount:', payment.custody_amount, 'MXNB');

        if (parseFloat(balanceFormatted) < parseFloat(payment.custody_amount)) {
            throw new Error(`Insufficient MXNB balance. Need: ${payment.custody_amount}, Have: ${balanceFormatted}`);
        }

        // Calculate deadline (custody_end timestamp or 24 hours from now)
        const custodyEndDate = new Date(payment.custody_end);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const custodyEndTimestamp = Math.floor(custodyEndDate.getTime() / 1000);
        
        let deadline;
        if (custodyEndTimestamp <= currentTimestamp) {
            // Deadline has passed, set a new future deadline
            const futureDate = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
            deadline = Math.floor(futureDate.getTime() / 1000);
            console.log('⏰ Original deadline passed, setting new deadline:', new Date(deadline * 1000).toISOString());
        } else {
            deadline = custodyEndTimestamp;
            console.log('⏰ Using original deadline:', custodyEndDate.toISOString());
        }

        // Prepare escrow creation
        const escrowAddress = process.env.KUSTODIA_ESCROW_V2_ADDRESS;
        const tokenAddress = process.env.MXNB_CONTRACT_SEPOLIA;
        const custodyAmountWei = ethers.parseUnits(payment.custody_amount.toString(), decimals);

        console.log('📝 Approving MXNB spending...');
        const approveTx = await mxnbContract.approve(escrowAddress, custodyAmountWei);
        await approveTx.wait();
        console.log('✅ MXNB approval confirmed:', approveTx.hash);

        // Create escrow on smart contract
        console.log('🔨 Creating escrow on smart contract...');
        const escrowContract = new ethers.Contract(
            escrowAddress,
            [
                'function createEscrow(address token, uint256 amount, address payer, address payee, uint256 deadline, string memory vertical, string memory clabe, string memory conditions) returns (uint256)',
                'function escrowCount() view returns (uint256)'
            ],
            bridgeWallet
        );

        const createEscrowTx = await escrowContract.createEscrow(
            tokenAddress,
            custodyAmountWei,
            bridgeWallet.address, // payer (bridge wallet)
            bridgeWallet.address, // payee (bridge wallet manages custody)
            deadline,
            payment.vertical_type || '',
            payment.deposit_clabe || '',
            'Flow 1: Platform-managed custody - Payment 141 manual completion'
        );

        console.log('⏳ Waiting for escrow creation confirmation...');
        const receipt = await createEscrowTx.wait();
        console.log('✅ Escrow creation confirmed:', createEscrowTx.hash);

        // Get the escrow ID from the contract
        const escrowCount = await escrowContract.escrowCount();
        const smartContractEscrowId = escrowCount.toString();
        console.log('🆔 Smart contract escrow ID:', smartContractEscrowId);

        // Update database with smart contract escrow ID and status
        console.log('💾 Updating database...');
        await AppDataSource.query(`
            UPDATE escrow 
            SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
            WHERE id = $3
        `, [smartContractEscrowId, createEscrowTx.hash, payment.escrow_id]);

        // Update payment status to escrowed
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
                smart_contract_escrow_id: smartContractEscrowId,
                custody_amount: payment.custody_amount,
                transaction_hash: createEscrowTx.hash,
                deadline: new Date(deadline * 1000).toISOString(),
                manual_completion: true
            }),
            false // Manual completion, not automatic
        ]);

        console.log('🎉 Escrow creation completed successfully!');
        console.log('📊 Summary:');
        console.log('  - Payment ID:', payment.id);
        console.log('  - Escrow ID:', payment.escrow_id);
        console.log('  - Smart Contract Escrow ID:', smartContractEscrowId);
        console.log('  - Custody Amount:', payment.custody_amount, 'MXNB');
        console.log('  - Transaction Hash:', createEscrowTx.hash);
        console.log('  - Release Date:', new Date(deadline * 1000).toISOString());
        console.log('  - Database Status: Updated to "active"');
        console.log('  - Payment Status: Updated to "escrowed"');

        // Verify final state
        const finalCheck = await AppDataSource.query(`
            SELECT p.id, p.status, e.status as escrow_status, e.smart_contract_escrow_id, e.custody_end, e.blockchain_tx_hash
            FROM payment p 
            JOIN escrow e ON p.escrow_id = e.id 
            WHERE p.id = $1
        `, [payment.id]);
        
        console.log('🔍 Final state:', finalCheck[0]);
        
        console.log('\n✅ Payment 141 is now ready for automatic release when custody period ends!');
        console.log('🔄 The automation service will handle the release and final payout automatically.');
        console.log('📅 Release scheduled for:', new Date(deadline * 1000).toISOString());

    } catch (error) {
        console.error('❌ Error completing escrow:', error);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.reason) {
            console.error('Error reason:', error.reason);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
completeEscrowPayment141().catch(console.error);
