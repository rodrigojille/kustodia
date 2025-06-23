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
const REDEMPTION_AMOUNT = 1000; // 1000 MXNB from Payment 81 escrow

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function completePayment81Redemption() {
  console.log('💱 COMPLETING PAYMENT 81 MXNB REDEMPTION');
  console.log('========================================');
  console.log(`Payment ID: ${PAYMENT_ID}`);
  console.log(`Redemption Amount: ${REDEMPTION_AMOUNT} MXNB → ${REDEMPTION_AMOUNT} MXN`);
  console.log(`Juno Environment: ${JUNO_ENV}`);
  console.log(`Destination Bank Account: ${JUNO_SELLER_BANK_ACCOUNT_ID}`);
  console.log('');

  try {
    await client.connect();

    // Step 1: Verify escrow is released
    console.log('📋 Step 1: Verifying escrow status...');
    const escrowCheck = await client.query(`
      SELECT 
        p.id as payment_id,
        p.status as payment_status,
        p.recipient_email,
        p.payout_clabe,
        e.status as escrow_status,
        e.custody_amount
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = $1
    `, [PAYMENT_ID]);

    if (escrowCheck.rows.length === 0) {
      throw new Error(`Payment ${PAYMENT_ID} not found`);
    }

    const payment = escrowCheck.rows[0];
    console.log(`✅ Payment ${payment.payment_id}: ${payment.payment_status}`);
    console.log(`✅ Escrow Status: ${payment.escrow_status}`);
    console.log(`✅ Custody Amount: ${payment.custody_amount} MXNB`);
    console.log(`✅ Recipient: ${payment.recipient_email}`);
    console.log(`✅ Payout CLABE: ${payment.payout_clabe}`);

    if (payment.escrow_status !== 'released') {
      throw new Error(`Escrow not released. Current status: ${payment.escrow_status}`);
    }
    console.log('');

    // Step 2: Check if redemption already completed
    console.log('📋 Step 2: Checking for existing redemption...');
    const existingRedemption = await client.query(`
      SELECT * FROM payment_event 
      WHERE "paymentId" = $1 AND type = 'mxnb_redeemed'
    `, [PAYMENT_ID]);

    if (existingRedemption.rows.length > 0) {
      console.log('✅ Redemption already completed');
      console.log(`✅ Completed at: ${existingRedemption.rows[0].created_at}`);
      console.log('');
      
      // Check if payment is marked as completed
      if (payment.payment_status !== 'completed') {
        console.log('🔄 Updating payment status to completed...');
        await client.query(`
          UPDATE payment SET status = 'completed' WHERE id = $1
        `, [PAYMENT_ID]);
        
        await client.query(`
          INSERT INTO payment_event ("paymentId", type, description, created_at)
          VALUES ($1, $2, $3, $4)
        `, [
          PAYMENT_ID,
          'payment_completed',
          'Payment marked as completed after successful MXNB redemption',
          new Date()
        ]);
        
        console.log('✅ Payment status updated to completed');
      }
      
      console.log('🎉 PAYMENT 81 ALREADY FULLY COMPLETED!');
      return { success: true, alreadyCompleted: true };
    }
    console.log('');

    // Step 3: Execute MXNB redemption via Juno API
    console.log('💱 Step 3: Executing MXNB redemption via Juno...');
    
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

    console.log('📤 Making Juno API call...');
    console.log(`URL: ${url}`);
    console.log(`Body: ${body}`);
    
    try {
      const response = await axios.post(url, bodyObj, { headers });
      
      console.log('✅ JUNO REDEMPTION SUCCESSFUL!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // Step 4: Log redemption in database
      console.log('');
      console.log('📝 Step 4: Logging redemption success...');
      
      await client.query(`
        INSERT INTO payment_event ("paymentId", type, description, created_at)
        VALUES ($1, $2, $3, $4)
      `, [
        PAYMENT_ID,
        'mxnb_redeemed',
        `Successfully redeemed ${REDEMPTION_AMOUNT} MXNB to MXN via Juno. Redemption ID: ${response.data.id || 'N/A'}`,
        new Date()
      ]);
      
      // Step 5: Mark payment as completed
      console.log('📝 Step 5: Marking payment as completed...');
      
      await client.query(`
        UPDATE payment SET status = 'completed' WHERE id = $1
      `, [PAYMENT_ID]);
      
      await client.query(`
        INSERT INTO payment_event ("paymentId", type, description, created_at)
        VALUES ($1, $2, $3, $4)
      `, [
        PAYMENT_ID,
        'payment_completed',
        `Payment completed successfully. SPEI payout to ${payment.payout_clabe} for ${payment.recipient_email}`,
        new Date()
      ]);
      
      console.log('✅ Payment marked as completed');
      console.log('');
      
      // Final Summary
      console.log('🎉 PAYMENT 81 REDEMPTION FLOW COMPLETED SUCCESSFULLY!');
      console.log('====================================================');
      console.log(`✅ Escrow Released: 1000 MXNB → Bridge Wallet`);
      console.log(`✅ MXNB Redeemed: ${REDEMPTION_AMOUNT} MXNB → ${REDEMPTION_AMOUNT} MXN`);
      console.log(`✅ Recipient: ${payment.recipient_email}`);
      console.log(`✅ Payout CLABE: ${payment.payout_clabe}`);
      console.log(`✅ Payment Status: completed`);
      console.log(`✅ Juno Redemption ID: ${response.data.id || 'N/A'}`);
      console.log(`✅ Total Flow: Escrow → Bridge Wallet → Juno Redemption → SPEI Payout`);
      
      return {
        success: true,
        redemptionId: response.data.id,
        amount: REDEMPTION_AMOUNT,
        paymentCompleted: true
      };
      
    } catch (apiError) {
      console.error('❌ Juno API Error:', apiError.response?.data || apiError.message);
      
      // Log API error
      await client.query(`
        INSERT INTO payment_event ("paymentId", type, description, created_at)
        VALUES ($1, $2, $3, $4)
      `, [
        PAYMENT_ID,
        'redemption_error',
        `Failed to redeem MXNB via Juno: ${apiError.response?.data?.message || apiError.message}`,
        new Date()
      ]);
      
      throw apiError;
    }

  } catch (error) {
    console.error('❌ Error in redemption process:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

completePayment81Redemption();
