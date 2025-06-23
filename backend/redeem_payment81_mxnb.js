require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const { Client } = require('pg');

// Environment variables
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
const JUNO_SELLER_BANK_ACCOUNT_ID = process.env.JUNO_SELLER_BANK_ACCOUNT_ID;

const PAYMENT_ID = 81;
const REDEMPTION_AMOUNT = 1000; // 1000 MXNB to redeem for Payment 81

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function redeemPayment81MXNB() {
  console.log('💱 MXNB REDEMPTION - PAYMENT 81');
  console.log('==============================');
  console.log(`Payment ID: ${PAYMENT_ID}`);
  console.log(`Redemption Amount: ${REDEMPTION_AMOUNT} MXNB`);
  console.log(`Juno Environment: ${JUNO_ENV}`);
  console.log(`Seller Bank Account: ${JUNO_SELLER_BANK_ACCOUNT_ID}`);
  console.log('');

  if (!JUNO_SELLER_BANK_ACCOUNT_ID) {
    console.error('❌ JUNO_SELLER_BANK_ACCOUNT_ID not found in environment variables');
    return;
  }

  try {
    await client.connect();

    // Step 1: Get payment details
    console.log('📋 Step 1: Getting payment details...');
    const paymentQuery = await client.query(`
      SELECT p.*, e.custody_amount, e.status as escrow_status
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = $1
    `, [PAYMENT_ID]);

    if (paymentQuery.rows.length === 0) {
      throw new Error(`Payment ${PAYMENT_ID} not found`);
    }

    const payment = paymentQuery.rows[0];
    console.log(`✅ Payment ${payment.id}: ${payment.amount} MXN`);
    console.log(`✅ Recipient: ${payment.recipient_email}`);
    console.log(`✅ Payout CLABE: ${payment.payout_clabe}`);
    console.log(`✅ Escrow Status: ${payment.escrow_status}`);
    console.log(`✅ Custody Amount: ${payment.custody_amount} MXNB`);
    console.log('');

    // Step 2: Call Juno redemption API
    console.log('💱 Step 2: Calling Juno redemption API...');
    
    const apiPath = "/mint_platform/v1/redemptions";
    const url = `${JUNO_BASE_URL}${apiPath}`;
    const method = "POST";
    const bodyObj = {
      amount: REDEMPTION_AMOUNT,
      destination_bank_account_id: JUNO_SELLER_BANK_ACCOUNT_ID,
      asset: "mxn",
    };
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const stringToSign = `${nonce}${method}${apiPath}${body}`;
    const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(stringToSign).digest("hex");
    
    const headers = {
      Authorization: `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
      "Content-Type": "application/json",
    };

    console.log('📤 API Request Details:');
    console.log(`URL: ${url}`);
    console.log(`Method: ${method}`);
    console.log(`Body: ${body}`);
    console.log(`Nonce: ${nonce}`);
    console.log(`String to sign: ${stringToSign}`);
    console.log(`Signature: ${signature}`);
    console.log('');

    console.log('🚀 Making API call...');
    const response = await axios.post(url, bodyObj, { headers });
    
    console.log('✅ Juno redemption successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Step 3: Log redemption in database
    console.log('📝 Step 3: Logging redemption in database...');
    
    // Insert payment event
    await client.query(`
      INSERT INTO payment_event (payment_id, type, data, timestamp)
      VALUES ($1, $2, $3, $4)
    `, [
      PAYMENT_ID,
      'mxnb_redeemed',
      JSON.stringify({
        amount: REDEMPTION_AMOUNT,
        junoResponse: response.data,
        redeemedAt: Date.now(),
        destinationBankAccount: JUNO_SELLER_BANK_ACCOUNT_ID
      }),
      new Date()
    ]);

    // Update payment status to completed
    await client.query(`
      UPDATE payment 
      SET status = 'completed' 
      WHERE id = $1
    `, [PAYMENT_ID]);

    // Insert completion event
    await client.query(`
      INSERT INTO payment_event (payment_id, type, data, timestamp)
      VALUES ($1, $2, $3, $4)
    `, [
      PAYMENT_ID,
      'payment_completed',
      JSON.stringify({
        completedAt: Date.now(),
        finalAmount: REDEMPTION_AMOUNT,
        recipientEmail: payment.recipient_email,
        payoutClabe: payment.payout_clabe,
        junoRedemptionId: response.data.id || response.data.redemption_id
      }),
      new Date()
    ]);

    console.log('✅ Database updated successfully');
    console.log('');

    // Final Summary
    console.log('🎉 PAYMENT 81 MXNB REDEMPTION COMPLETED!');
    console.log('======================================');
    console.log(`✅ Redeemed: ${REDEMPTION_AMOUNT} MXNB → ${REDEMPTION_AMOUNT} MXN`);
    console.log(`✅ Recipient: ${payment.recipient_email}`);
    console.log(`✅ Payout CLABE: ${payment.payout_clabe}`);
    console.log(`✅ Payment Status: completed`);
    console.log(`✅ Juno Redemption ID: ${response.data.id || response.data.redemption_id || 'N/A'}`);
    console.log(`✅ Events logged: 2`);

  } catch (error) {
    console.error('❌ Error in MXNB redemption:', error.message);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    
    // Log error in database
    try {
      await client.query(`
        INSERT INTO payment_event (payment_id, type, data, timestamp)
        VALUES ($1, $2, $3, $4)
      `, [
        PAYMENT_ID,
        'redemption_error',
        JSON.stringify({
          error: error.message,
          apiError: error.response?.data,
          timestamp: Date.now()
        }),
        new Date()
      ]);
    } catch (e) {
      console.error('Failed to log error:', e.message);
    }
    
    throw error;
  } finally {
    await client.end();
  }
}

redeemPayment81MXNB();
