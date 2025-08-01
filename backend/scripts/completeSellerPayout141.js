require('dotenv').config({ path: '../.env' });
const { DataSource } = require('typeorm');
const { redeemMXNBToMXN, registerBankAccount, initializeJunoService } = require('../dist/services/junoService');

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
});

async function completeSellerPayout() {
    try {
        console.log('🚀 Starting seller payout for Payment 141...');
        
        // Initialize Juno service
        initializeJunoService();
        
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        // Get payment and seller details
        const paymentData = await AppDataSource.query(`
            SELECT p.id, p.amount, p.recipient_email,
                   u.id as seller_id, u.full_name as seller_name, u.payout_clabe, u.juno_bank_account_id,
                   e.custody_amount, e.status as escrow_status
            FROM payment p
            JOIN "user" u ON p.seller_id = u.id
            LEFT JOIN escrow e ON p.escrow_id = e.id
            WHERE p.id = 141
        `);

        if (paymentData.length === 0) {
            throw new Error('Payment 141 not found');
        }

        const payment = paymentData[0];
        console.log('📋 Payment 141 details:');
        console.log('  - Total Amount:', payment.amount, 'MXN');
        console.log('  - Custody Amount:', payment.custody_amount, 'MXN');
        console.log('  - Seller:', payment.recipient_email);
        console.log('  - Seller Name:', payment.seller_name);
        console.log('  - Seller CLABE:', payment.payout_clabe);
        console.log('  - Juno Bank Account ID:', payment.juno_bank_account_id);

        // Calculate payout amount (total - custody)
        const totalAmount = parseFloat(payment.amount);
        const custodyAmount = parseFloat(payment.custody_amount);
        const payoutAmount = totalAmount - custodyAmount;
        
        console.log('💰 Payout calculation:');
        console.log('  - Total:', totalAmount, 'MXN');
        console.log('  - Custody (in escrow):', custodyAmount, 'MXN');
        console.log('  - Immediate payout:', payoutAmount, 'MXN');

        if (payoutAmount <= 0) {
            console.log('⚠️ No immediate payout needed (full amount in custody)');
            return;
        }

        // Check if seller has bank account registered
        if (!payment.juno_bank_account_id) {
            console.log('❌ Seller does not have Juno bank account registered');
            console.log('💡 Need to register bank account first with CLABE:', payment.payout_clabe);
            
            // Auto-register bank account
            try {
                console.log('🔄 Auto-registering seller bank account...');
                const bankAccountId = await registerBankAccount(payment.payout_clabe, payment.seller_name);
                console.log('✅ Bank account registered:', bankAccountId);
                
                // Update user record
                await AppDataSource.query(`
                    UPDATE "user" 
                    SET juno_bank_account_id = $1, updated_at = NOW()
                    WHERE id = $2
                `, [bankAccountId, payment.seller_id]);
                
                payment.juno_bank_account_id = bankAccountId;
                console.log('✅ Updated seller record with bank account ID');
                
            } catch (error) {
                console.error('❌ Failed to register bank account:', error.message);
                throw error;
            }
        }

        // Perform MXNB redemption (seller payout)
        console.log('💸 Processing seller redemption...');
        console.log('  - Amount:', payoutAmount, 'MXN');
        console.log('  - Bank Account ID:', payment.juno_bank_account_id);
        
        try {
            const redemptionResult = await redeemMXNBToMXN(
                payoutAmount,
                payment.juno_bank_account_id,
                `seller-payout-${payment.id}-${Date.now()}`
            );
            
            console.log('✅ Seller redemption successful!');
            console.log('  - Transaction ID:', redemptionResult.transactionId);
            console.log('  - Status:', redemptionResult.status);
            
            // Create payment event for seller payout
            await AppDataSource.query(`
                INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'payout_completed',
                JSON.stringify({
                    amount: payoutAmount,
                    recipient: payment.recipient_email,
                    bank_account_id: payment.juno_bank_account_id,
                    transaction_id: redemptionResult.transactionId,
                    payout_type: 'immediate_seller_payout',
                    manual_completion: true
                }),
                false
            ]);
            
            console.log('✅ Payment event created');
            
            // Check if we should update payment status
            const escrowStatus = payment.escrow_status;
            if (escrowStatus === 'active') {
                // Payment is now fully processed (immediate payout done + escrow active)
                console.log('🎉 Payment 141 is now fully processed!');
                console.log('📊 Final status:');
                console.log('  - Immediate payout:', payoutAmount, 'MXN → Seller via SPEI');
                console.log('  - Escrow custody:', custodyAmount, 'MXN → Smart contract (will release automatically)');
                console.log('  - Total secured:', totalAmount, 'MXN');
            }
            
        } catch (error) {
            console.error('❌ Seller redemption failed:', error.message);
            
            // Log the failure but don't throw - escrow is still secure
            await AppDataSource.query(`
                INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'payout_failed',
                JSON.stringify({
                    amount: payoutAmount,
                    recipient: payment.recipient_email,
                    error: error.message,
                    payout_type: 'immediate_seller_payout',
                    manual_attempt: true
                }),
                false
            ]);
            
            console.log('⚠️ Payout failed but funds are secure:');
            console.log('  - Failed payout amount remains in Juno for manual processing');
            console.log('  - Escrow custody is active and will release automatically');
            console.log('  - Total funds still secured:', totalAmount, 'MXN');
        }

    } catch (error) {
        console.error('❌ Error processing seller payout:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

completeSellerPayout().catch(console.error);
