const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Production configuration
const JUNO_API_KEY = process.env.JUNO_PROD_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_PROD_API_SECRET;
const BASE_URL = 'https://buildwithjuno.com';

// CLABE from Payment 151
const CLABE_TO_VERIFY = '710969000052950801';

async function verifyClabe() {
    console.log('🔍 VERIFYING PRODUCTION CLABE');
    console.log('=============================');
    console.log('CLABE:', CLABE_TO_VERIFY);
    console.log('Environment: Production');
    console.log('API Endpoint:', `${BASE_URL}/spei/v1/clabes/${CLABE_TO_VERIFY}`);
    console.log('');
    
    const endpoint = `/spei/v1/clabes/${CLABE_TO_VERIFY}`;
    const url = `${BASE_URL}${endpoint}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = '';
    
    // Build signature for authentication
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    
    console.log('🔐 Authentication:');
    console.log(`API Key: ${JUNO_API_KEY.substring(0, 4)}...`);
    console.log(`Nonce: ${nonce}`);
    console.log(`Signature: ${signature.substring(0, 8)}...`);
    console.log('');
    
    try {
        console.log('📡 Making CLABE verification request...');
        const response = await axios.get(url, { headers });
        
        console.log('✅ CLABE VERIFICATION RESPONSE:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.payload) {
            const clabe = response.data.payload;
            console.log('');
            console.log('🎉 CLABE DETAILS CONFIRMED:');
            console.log(`  - CLABE: ${clabe.clabe}`);
            console.log(`  - Status: ${clabe.status}`);
            console.log(`  - Type: ${clabe.type}`);
            console.log(`  - Bank: ${clabe.bank_name || 'N/A'}`);
            console.log(`  - Created: ${clabe.created_at}`);
            console.log(`  - Updated: ${clabe.updated_at}`);
            
            if (clabe.status === 'ENABLED') {
                console.log('');
                console.log('✅ CLABE IS ACTIVE AND READY FOR DEPOSITS!');
                console.log('🚀 Safe to proceed with SPEI transfer');
                console.log('💰 This CLABE can receive real money transfers');
            } else {
                console.log('');
                console.log('⚠️  CLABE STATUS:', clabe.status);
                console.log('❌ May not be ready for deposits');
            }
        }
        
    } catch (error) {
        console.error('❌ Error verifying CLABE:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.status === 404) {
                console.error('');
                console.error('🚨 CLABE NOT FOUND IN PRODUCTION!');
                console.error('❌ DO NOT send SPEI - CLABE does not exist');
                console.error('🔧 Need to create CLABE first');
            }
        } else {
            console.error('Error:', error.message);
        }
    }
}

console.log('🔍 PRODUCTION CLABE VERIFICATION');
console.log('Time:', new Date().toISOString());
console.log('Payment ID: 151');
console.log('');

verifyClabe().catch(console.error);
