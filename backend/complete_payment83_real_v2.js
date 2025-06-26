const dotenv = require('dotenv');
const axios = require('axios');
const crypto = require('crypto');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

console.log('=== PAYMENT 83 REAL COMPLETION V2 ===');

// Juno API Configuration
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

console.log(`🔧 Using Juno environment: ${JUNO_ENV}`);
console.log(`🔑 API Key: ${JUNO_API_KEY?.slice(0, 4)}...`);

// Database connection
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

async function redeemMXNbForMXN(amountMXNb) {
    console.log(`🔄 Redeeming ${amountMXNb} MXNB for MXN via Juno...`);
    
    const endpoint = '/api/v3/redemptions/';
    const url = `${JUNO_BASE_URL}${endpoint}`;
    const bodyObj = {
        currency: "mxnb",
        amount: String(amountMXNb),
        notes_ref: "Kustodia redemption Payment 83",
        origin_id: "kustodia_payment_83",
    };
    
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = "POST";
    const requestPath = "/api/v3/redemptions/";
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(dataToSign).digest("hex");
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };

    try {
        console.log('📤 Sending redemption request to:', url);
        console.log('📋 Request body:', bodyObj);
        
        const response = await axios.post(url, bodyObj, { headers });
        console.log('✅ MXNB redemption successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ MXNB redemption failed:', error.response?.data || error.message);
        throw error;
    }
}

async function sendJunoPayment(clabe, amount, description) {
    console.log(`💸 Sending ${amount} MXN to CLABE ${clabe}...`);
    
    const endpoint = '/api/v3/withdrawals/';
    const url = `${JUNO_BASE_URL}${endpoint}`;
    const bodyObj = {
        currency: "mxn",
        protocol: "clabe",
        amount: String(amount),
        beneficiary: "Pago Kustodia",
        clabe,
        notes_ref: description || "Pago Kustodia",
        numeric_ref: "1234567",
        rfc: "XAXX010101000",
        origin_id: "kustodia_payment_83",
    };
    
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = "POST";
    const requestPath = "/api/v3/withdrawals/";
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(dataToSign).digest("hex");
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };

    try {
        console.log('📤 Sending withdrawal request to:', url);
        console.log('📋 Request body:', bodyObj);
        
        const response = await axios.post(url, bodyObj, { headers });
        console.log('✅ SPEI payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SPEI payment failed:', error.response?.data || error.message);
        throw error;
    }
}

async function updatePaymentStatus(paymentId, status) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE payment SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, paymentId]
        );
        console.log(`✅ Payment ${paymentId} status updated to: ${status}`);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Failed to update payment status:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateEscrowStatus(paymentId, status) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE escrow SET status = $1, updated_at = NOW() WHERE payment_id = $2 RETURNING *',
            [status, paymentId]
        );
        console.log(`✅ Escrow for Payment ${paymentId} status updated to: ${status}`);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Failed to update escrow status:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function logPaymentEvent(paymentId, event, description, metadata = {}) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO payment_event (payment_id, event, description, metadata, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [paymentId, event, description, JSON.stringify(metadata)]
        );
        console.log(`📝 Event logged: ${event} for Payment ${paymentId}`);
        return result.rows[0];
    } catch (error) {
        console.error('❌ Failed to log payment event:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function getPaymentDetails(paymentId) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT p.*, u.clabe as payout_clabe FROM payment p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
            [paymentId]
        );
        return result.rows[0];
    } catch (error) {
        console.error('❌ Failed to get payment details:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function completePayment83() {
    try {
        const paymentId = 83;
        
        console.log(`🎯 Starting real completion of Payment ${paymentId}`);
        
        // Get payment details
        const payment = await getPaymentDetails(paymentId);
        if (!payment) {
            throw new Error(`Payment ${paymentId} not found`);
        }
        
        console.log(`📋 Payment Details:`, {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            payout_clabe: payment.payout_clabe
        });
        
        if (payment.status === 'completed') {
            console.log('⚠️  Payment already completed, skipping...');
            return;
        }
        
        // Step 1: Redeem MXNB tokens to MXN
        console.log('\n🔄 Step 1: MXNB Redemption');
        const redemptionResult = await redeemMXNbForMXN(payment.amount);
        await logPaymentEvent(paymentId, 'mxnb_redemption', 'MXNB tokens redeemed for MXN', redemptionResult);
        
        // Step 2: Send SPEI payment to recipient
        console.log('\n💸 Step 2: SPEI Payment');
        const speiResult = await sendJunoPayment(
            payment.payout_clabe, 
            payment.amount, 
            `Pago Kustodia #${paymentId}`
        );
        await logPaymentEvent(paymentId, 'spei_sent', 'SPEI payment sent to recipient', speiResult);
        
        // Step 3: Update payment status
        console.log('\n📊 Step 3: Status Updates');
        await updatePaymentStatus(paymentId, 'completed');
        await updateEscrowStatus(paymentId, 'completed');
        await logPaymentEvent(paymentId, 'payment_completed', 'Payment successfully completed');
        
        console.log('\n🎉 PAYMENT 83 COMPLETED SUCCESSFULLY!');
        console.log('📊 Final Summary:');
        console.log(`   Payment ID: ${paymentId}`);
        console.log(`   Amount: ${payment.amount} MXN`);
        console.log(`   Recipient CLABE: ${payment.payout_clabe}`);
        console.log(`   Status: COMPLETED ✅`);
        
        return {
            success: true,
            paymentId,
            amount: payment.amount,
            redemption: redemptionResult,
            spei: speiResult
        };
        
    } catch (error) {
        console.error('❌ Payment completion failed:', error);
        await logPaymentEvent(83, 'completion_failed', 'Real completion failed', { error: error.message });
        throw error;
    }
}

// Run the completion
completePayment83()
    .then((result) => {
        console.log('\n✅ All operations completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal Error:', error.message);
        process.exit(1);
    });
