require('dotenv').config({ path: '../.env' });
const { DataSource } = require('typeorm');

// Import the compiled escrow service
const { createEscrow } = require('../dist/services/escrowService');

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
        console.log('🚀 Starting escrow completion for Payment 141 using automation service approach...');
        
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
        const bridgeWallet = process.env.ESCROW_BRIDGE_WALLET;
        
        console.log('🔗 Bridge wallet address:', bridgeWallet);
        console.log('📝 Contract addresses:');
        console.log('  - MXNB Token:', tokenAddress);
        console.log('  - Escrow Contract:', process.env.KUSTODIA_ESCROW_V2_ADDRESS);

        // Calculate deadline (same logic as PaymentAutomationService)
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

        // Create escrow using the proper service function (matches PaymentAutomationService)
        console.log('🔨 Creating escrow using automation service approach...');
        
        const createResult = await createEscrow({
            payer: bridgeWallet,
            payee: bridgeWallet, // Flow 1: Bridge wallet manages custody for both parties
            token: tokenAddress,
            amount: payment.custody_amount.toString(),
            deadline: deadline,
            vertical: payment.vertical_type || '',
            clabe: payment.deposit_clabe || '',
            conditions: 'Flow 1: Platform-managed custody - Payment 141 manual completion'
        });

        if (!createResult?.escrowId) {
            throw new Error('Escrow creation failed to return a valid ID.');
        }

        console.log('✅ Escrow created successfully!');
        console.log('  - Smart Contract Escrow ID:', createResult.escrowId);
        console.log('  - Transaction Hash:', createResult.txHash);

        // Update database (same as PaymentAutomationService)
        console.log('💾 Updating database...');
        
        await AppDataSource.query(`
            UPDATE escrow 
            SET smart_contract_escrow_id = $1, status = 'active', blockchain_tx_hash = $2, updated_at = NOW()
            WHERE id = $3
        `, [createResult.escrowId, createResult.txHash, payment.escrow_id]);

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
                manual_completion: true,
                flow: 'Flow 1: Platform-managed custody'
            }),
            false
        ]);

        console.log('🎉 Escrow creation completed successfully!');
        console.log('📊 Summary:');
        console.log('  - Payment ID:', payment.id);
        console.log('  - Escrow ID:', payment.escrow_id);
        console.log('  - Smart Contract Escrow ID:', createResult.escrowId);
        console.log('  - Custody Amount:', payment.custody_amount, 'MXNB');
        console.log('  - Transaction Hash:', createResult.txHash);
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
        console.error('❌ Error completing escrow:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.reason) {
            console.error('Error reason:', error.reason);
        }
        if (error.stack) {
            console.error('Stack trace:', error.stack);
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
