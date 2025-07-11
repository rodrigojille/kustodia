require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'http://localhost:3001'; // Adjust if needed
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const client = new Client({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

client.connect();

async function releasePayment88Escrow() {
  try {
    console.log('=== RELEASING PAYMENT 88 ESCROW ===');
    
    // First check current payment and escrow status
    console.log('1. Checking payment 88 status...');
    const paymentUrl = `${BASE_URL}/api/payments/88`;
    const paymentRes = await axios.get(paymentUrl);
    const payment = paymentRes.data.payment;
    const escrow = payment.escrow;
    
    console.log(`Escrow ID: ${escrow.id}`);
    console.log(`Payment ID: ${escrow.payment_id}`);
    console.log(`Current Status: ${escrow.status}`);
    console.log(`Amount: ${escrow.amount}`);
    
    // Check if escrow is eligible for release
    const daysSinceCreated = Math.floor((new Date() - new Date(escrow.created_at)) / (1000 * 60 * 60 * 24));
    console.log(`Days since created: ${daysSinceCreated}`);
    
    if (escrow.status === 'released') {
      console.log('✅ Escrow is already released');
      return;
    }
    
    if (escrow.status === 'funded' && daysSinceCreated >= 3) {
      console.log('🟡 Escrow has been funded for 3+ days - should be released');
      
      // Check if there's a release endpoint
      try {
        console.log('2. Attempting to release escrow...');
        const releaseUrl = `${BASE_URL}/api/escrow/${escrow.id}/release`;
        const releaseRes = await axios.post(releaseUrl);
        console.log('✅ Escrow release successful:', releaseRes.data);
      } catch (releaseError) {
        console.log('❌ Direct release failed, checking manual process...');
        console.error('Release error:', releaseError.response?.data || releaseError.message);
        
        // Alternative: Check if we can trigger automation manually
        try {
          console.log('3. Checking automation trigger...');
          const automationUrl = `${BASE_URL}/api/automation/process-payouts`;
          const automationRes = await axios.post(automationUrl);
          console.log('✅ Automation triggered:', automationRes.data);
        } catch (automationError) {
          console.log('❌ Automation trigger failed');
          console.error('Automation error:', automationError.response?.data || automationError.message);
          
          console.log('\n🛠️ MANUAL FIX REQUIRED:');
          console.log('The escrow status needs to be updated from "funded" to "active" so automation can process it.');
          console.log('Alternatively, it can be directly updated to "released" if the 3-day period has passed.');
        }
      }
    } else {
      console.log(`⏳ Escrow status: ${escrow.status}, not eligible for automatic release yet`);
    }
    
    // Check payment status after release attempt
    console.log('\n4. Checking final payment status...');
    const paymentUrl = `${BASE_URL}/api/payments/88`;
    const paymentRes = await axios.get(paymentUrl);
    const payment = paymentRes.data.payment;
    
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Final Status: ${payment.status}`);
    console.log(`Amount: ${payment.amount}`);
    console.log(`Recipient: ${payment.recipient_email}`);
    
    if (payment.status === 'completed') {
      console.log('🎉 Payment 88 has been successfully completed!');
    } else {
      console.log('⏳ Payment 88 is still in process');
    }
    
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

releasePayment88Escrow();
