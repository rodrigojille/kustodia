/**
 * Manual trigger for Payment 151 automation
 * This will force the escrow creation process for Payment 151
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const PAYMENT_ID = 151;

async function triggerAutomation() {
    console.log('🚀 MANUALLY TRIGGERING PAYMENT 151 AUTOMATION');
    console.log('==============================================');
    console.log('Payment ID:', PAYMENT_ID);
    console.log('Backend URL:', BACKEND_URL);
    console.log('Time:', new Date().toISOString());
    console.log('');
    
    try {
        console.log('📡 Sending automation trigger request...');
        
        const response = await axios.post(`${BACKEND_URL}/api/automation/trigger-payment-automation`, {
            paymentId: PAYMENT_ID
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ AUTOMATION TRIGGER RESPONSE:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('');
        console.log('🎯 Payment 151 automation triggered successfully!');
        console.log('⏳ Watch backend logs for escrow creation progress...');
        
    } catch (error) {
        console.error('❌ Error triggering automation:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        console.log('');
        console.log('💡 Alternative: Wait for next retry cycle (every 3 minutes)');
        console.log('🔄 The retryFailedEscrowCreations will pick up Payment 151');
    }
}

triggerAutomation().catch(console.error);
