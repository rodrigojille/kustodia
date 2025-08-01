require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const { DataSource } = require('typeorm');
const { createEscrow } = require('../dist/services/escrowService');
const { createPaymentNotifications } = require('../dist/services/paymentNotificationIntegration');

// Database connection
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'kustodia',
    synchronize: false,
    logging: false,
    entities: ['../src/entities/*.ts'],
});

async function completeEscrowPayment141() {
    try {
        console.log('🚀 Starting escrow completion for Payment 141...');
        
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Get payment and escrow data
        const result = await AppDataSource.query(`
            SELECT p.id, p.amount, p.user_id, p.seller_id, 
                   e.id as escrow_id, e.custody_amount, e.custody_end
            FROM payment p 
            JOIN escrow e ON p.escrow_id = e.id 
            WHERE p.id = 141
        `);

        if (!result || result.length === 0) {
            throw new Error('Payment 141 not found');
        }

        const payment = result[0];
        console.log('📋 Payment data:', {
            id: payment.id,
            amount: payment.amount,
            escrow_id: payment.escrow_id,
            custody_amount: payment.custody_amount,
            custody_end: payment.custody_end
        });

        // Setup blockchain connection
        const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
        const bridgeWallet = new ethers.Wallet(process.env.ESCROW_BRIDGE_PRIVATE_KEY, provider);
        
        console.log('🔗 Bridge wallet address:', bridgeWallet.address);
        const mxnbContract = new ethers.Contract(
            process.env.MXNB_CONTRACT_ADDRESS,
            [
                'function balanceOf(address) view returns (uint256)',
                'function decimals() view returns (uint8)'
            ],
            provider
        );

        // Check MXNB balance
        const balance = await mxnbContract.balanceOf(process.env.ESCROW_BRIDGE_WALLET);
        const decimals = await mxnbContract.decimals();
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        console.log('💰 Bridge wallet MXNB balance:', balanceFormatted);

        console.log('📊 Custody amount:', payment.custody_amount, 'MXNB');

        if (parseFloat(balanceFormatted) < parseFloat(payment.custody_amount)) {
            throw new Error(`Insufficient MXNB balance. Need: ${payment.custody_amount}, Have: ${balanceFormatted}`);
        }

        // Calculate deadline (custody_end timestamp)
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

        // Use the automation service's escrow creation method
        console.log('🔨 Creating escrow using automation service...');
        const createResult = await createEscrow({
            payer: process.env.ESCROW_BRIDGE_WALLET,
            payee: process.env.ESCROW_BRIDGE_WALLET, // Flow 1: Bridge wallet manages custody
            token: process.env.MXNB_CONTRACT_ADDRESS,
            amount: payment.custody_amount.toString(),
            deadline: deadline,
            vertical: payment.vertical_type || '',
            clabe: payment.deposit_clabe || '',
            conditions: 'Flow 1: Platform-managed custody - Manual completion for Payment 141'
        });

        if (!createResult?.escrowId) {
            throw new Error('Escrow creation failed to return a valid ID.');
        }

        console.log('✅ Escrow creation confirmed:', createResult.txHash);
        console.log('🆔 Smart contract escrow ID:', createResult.escrowId);

        // Update database with smart contract escrow ID and status
        console.log('💾 Updating database...');
        await AppDataSource.query(`
            UPDATE escrow 
            SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
            WHERE id = $3
        `, [createResult.escrowId, createResult.txHash, payment.escrow_id]);

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
                smart_contract_escrow_id: createResult.escrowId,
                custody_amount: payment.custody_amount,
                transaction_hash: createResult.txHash,
                deadline: new Date(deadline * 1000).toISOString(),
                manual_completion: true
            }),
            false // Manual completion, not automatic
        ]);

        // Send escrow created notifications
        console.log('📧 Sending escrow created notifications...');
        try {
            await createPaymentNotifications(payment.id, 'escrow_created');
            console.log('✅ Escrow created notifications sent');
        } catch (notificationError) {
            console.error('⚠️ Failed to send notifications:', notificationError);
        }

        console.log('🎉 Escrow creation completed successfully!');
        console.log('📊 Summary:');
        console.log('  - Payment ID:', payment.id);
        console.log('  - Escrow ID:', payment.escrow_id);
        console.log('  - Smart Contract Escrow ID:', createResult.escrowId);
        console.log('  - Custody Amount:', payment.custody_amount, 'MXNB');
        console.log('  - Transaction Hash:', createResult.txHash);
        console.log('  - Release Date:', new Date(deadline * 1000).toISOString());
        console.log('  - Database Status: Updated to "active"');
        console.log('  - Payment Status: Updated to "escrowed"');
        console.log('  - Notifications: Sent to buyer and seller');

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
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Run the script
completeEscrowPayment141()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
