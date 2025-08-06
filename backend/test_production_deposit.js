const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Production configuration
const JUNO_API_KEY = process.env.JUNO_PROD_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_PROD_API_SECRET;
const BASE_URL = 'https://buildwithjuno.com';

// Use the newly created CLABE from our test
const TEST_CLABE = '710969000052950584';
const TEST_AMOUNT = 1000; // 1000 MXN

async function mockDepositToClabe() {
    console.log('🧪 === MOCK DEPOSIT TEST: PRODUCTION CLABE ===');
    console.log('CLABE:', TEST_CLABE);
    console.log('Amount: $' + TEST_AMOUNT.toLocaleString() + ' MXN');
    console.log('Environment: Production');
    console.log('Expected Flow: Deposit → PaymentAutomationService → Escrow → Blockchain');
    console.log('');
    
    // Use the test endpoint like existing mock scripts
    const endpoint = '/spei/test/deposits';
    const url = `${BASE_URL}${endpoint}`;
    const method = 'POST';
    const nonce = Date.now().toString();
    
    // Match the payload format from existing mock scripts
    const requestBody = {
        clabe: TEST_CLABE,
        amount: TEST_AMOUNT,
        reference: `KUSTODIA_PROD_TEST_${Date.now()}`,
        sender_name: 'RODRIGO JILLE PRODUCTION TEST',
        sender_account: '123456789012345678',
        sender_bank: '002', // Banamex
        concept: 'Production mainnet test deposit'
    };
    
    const body = JSON.stringify(requestBody);
    
    // Build signature
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    
    console.log('\n📡 Making mock deposit request...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    try {
        const response = await axios.post(url, requestBody, { headers });
        console.log('\n✅ Mock Deposit Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.payload) {
            const payload = response.data.payload;
            console.log('\n🎉 DEPOSIT CREATED:');
            console.log(`  - Deposit ID: ${payload.id}`);
            console.log(`  - Amount: ${payload.amount} MXN`);
            console.log(`  - Status: ${payload.status}`);
            console.log(`  - Reference: ${payload.reference}`);
            console.log(`  - Created: ${payload.created_at}`);
            
            console.log('\n🔄 Expected PaymentAutomationService Flow:');
            console.log('1. Juno webhook will notify our backend (production)');
            console.log('2. Backend will process deposit and update payment status');
            console.log('3. PaymentAutomationService.processPaymentAutomation() triggered');
            console.log('4. 1-minute wait for Juno to mint MXNB tokens');
            console.log('5. Escrow creation on Arbitrum mainnet');
            console.log('6. Real blockchain transactions with real ETH gas fees');
            console.log('7. Email notifications sent to parties');
            console.log('8. Custody period management');
            console.log('');
            console.log('⚠️  CRITICAL: This will use REAL mainnet transactions!');
            
            // Return the deposit ID for webhook simulation
            return payload.id;
        }
        
    } catch (error) {
        console.error('\n❌ Error creating mock deposit:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        return null;
    }
}

async function checkDepositStatus(depositId) {
    if (!depositId) return;
    
    console.log('\n\n🔍 Checking Deposit Status');
    console.log('==========================');
    
    const endpoint = `/spei/v1/deposits/${depositId}`;
    const url = `${BASE_URL}${endpoint}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    
    try {
        const response = await axios.get(url, { headers });
        console.log('\n✅ Deposit Status Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('\n❌ Error checking deposit status:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function runProductionDepositTest() {
    console.log('🚀 STARTING PRODUCTION DEPOSIT TEST');
    console.log('===================================');
    console.log('Time:', new Date().toISOString());
    console.log('Backend should be running on localhost:4000');
    console.log('Blockchain: Arbitrum Mainnet');
    
    const depositId = await mockDepositToClabe();
    
    if (depositId) {
        console.log('\n⏳ Waiting 3 seconds before checking status...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await checkDepositStatus(depositId);
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Check your backend logs for webhook processing');
        console.log('2. Verify payment creation in database');
        console.log('3. Check blockchain transaction on Arbitrum mainnet');
        console.log('4. Monitor escrow contract interactions');
    }
}

runProductionDepositTest().catch(console.error);
