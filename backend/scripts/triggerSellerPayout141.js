require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const axios = require('axios');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
    database: process.env.DB_NAME || 'kustodia',
});

// Juno API setup
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

console.log(`🔧 Using Juno ${JUNO_ENV} environment`);
console.log(`🔑 API Key: ${JUNO_API_KEY?.slice(0, 4)}...`);

async function redeemMXNBToMXN(amount, destinationBankAccountId, idempotencyKey) {
    const url = `${JUNO_BASE_URL}/mint_platform/v1/redeem`;
    const requestPath = '/mint_platform/v1/redeem';
    const method = 'POST';
    const nonce = Date.now().toString();
    
    const body = JSON.stringify({
        amount: amount,
        destination_bank_account_id: destinationBankAccountId
    });

    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

    const headers = {
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey.substring(0, 36) // Limit to 36 chars
    };

    console.log('🔄 Making redemption request...');
    console.log('  - Amount:', amount, 'MXN');
    console.log('  - Bank Account ID:', destinationBankAccountId);
    console.log('  - Idempotency Key:', idempotencyKey.substring(0, 36));

    try {
        const response = await axios.post(url, JSON.parse(body), { headers });
        return response.data;
    } catch (error) {
        console.error('❌ Redemption failed:', error.response?.data || error.message);
        throw error;
    }
}

async function triggerSellerPayout() {
    let client;
    
    try {
        console.log('🚀 Starting seller payout for Payment 141...');
        
        client = await pool.connect();
        console.log('✅ Database connected');

        // Get payment and seller details
        const paymentQuery = `
            SELECT p.id, p.amount, p.recipient_email,
                   u.id as seller_id, u.full_name as seller_name, u.payout_clabe, u.juno_bank_account_id,
                   e.custody_amount, e.status as escrow_status
            FROM payment p
            JOIN "user" u ON p.seller_id = u.id
            LEFT JOIN escrow e ON p.escrow_id = e.id
            WHERE p.id = 141
        `;

        const result = await client.query(paymentQuery);
        if (result.rows.length === 0) {
            throw new Error('Payment 141 not found');
        }

        const payment = result.rows[0];
        console.log('📋 Payment 141 details:');
        console.log('  - Total Amount:', payment.amount, 'MXN');
        console.log('  - Custody Amount:', payment.custody_amount, 'MXN');
        console.log('  - Seller:', payment.recipient_email);
        console.log('  - Seller Name:', payment.seller_name);
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

        if (!payment.juno_bank_account_id) {
            console.log('❌ Seller does not have Juno bank account registered');
            console.log('💡 Need to register bank account first');
            
            // Log the missing bank account event
            await client.query(`
                INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'payout_blocked',
                JSON.stringify({
                    amount: payoutAmount,
                    recipient: payment.recipient_email,
                    reason: 'missing_bank_account',
                    seller_clabe: payment.payout_clabe,
                    action_required: 'register_bank_account'
                }),
                false
            ]);
            
            return;
        }

        // Perform MXNB redemption (seller payout)
        console.log('💸 Processing seller redemption...');
        
        try {
            const idempotencyKey = `payout-141-${Date.now()}`;
            const redemptionResult = await redeemMXNBToMXN(
                payoutAmount,
                payment.juno_bank_account_id,
                idempotencyKey
            );
            
            console.log('✅ Seller redemption successful!');
            console.log('  - Result:', redemptionResult);
            
            // Create payment event for successful seller payout
            await client.query(`
                INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'payout_completed',
                JSON.stringify({
                    amount: payoutAmount,
                    recipient: payment.recipient_email,
                    bank_account_id: payment.juno_bank_account_id,
                    redemption_result: redemptionResult,
                    payout_type: 'immediate_seller_payout',
                    idempotency_key: idempotencyKey
                }),
                false
            ]);
            
            console.log('✅ Payment event created');
            console.log('🎉 Payment 141 seller payout completed!');
            console.log('📊 Final status:');
            console.log('  - Immediate payout:', payoutAmount, 'MXN → Seller via SPEI');
            console.log('  - Escrow custody:', custodyAmount, 'MXN → Smart contract (active)');
            console.log('  - Total secured:', totalAmount, 'MXN');
            
        } catch (error) {
            console.error('❌ Seller redemption failed:', error.message);
            
            // Log the failure
            await client.query(`
                INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                payment.id,
                'payout_failed',
                JSON.stringify({
                    amount: payoutAmount,
                    recipient: payment.recipient_email,
                    error: error.response?.data || error.message,
                    payout_type: 'immediate_seller_payout',
                    funds_status: 'remains_in_juno_for_manual_processing'
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
    } finally {
        if (client) {
            client.release();
            console.log('🔌 Database connection closed');
        }
        await pool.end();
    }
}

triggerSellerPayout().catch(console.error);
