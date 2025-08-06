const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Force production environment
const JUNO_ENV = 'production';
const JUNO_API_KEY = process.env.JUNO_PROD_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_PROD_API_SECRET;
const BASE_URL = process.env.JUNO_PROD_BASE_URL || 'https://buildwithjuno.com';

// We need to check a production CLABE - let's use a recent one
const CLABE_TO_CHECK = '002668900881819471'; // From your .env JUNO_TEST_SENDER_CLABE

async function checkClabeStatusProd() {
    console.log('🔍 Checking CLABE Status in Juno PRODUCTION');
    console.log('==========================================');
    console.log('CLABE:', CLABE_TO_CHECK);
    console.log('Environment:', JUNO_ENV);
    console.log('Base URL:', BASE_URL);
    console.log('API Key Preview:', JUNO_API_KEY ? JUNO_API_KEY.substring(0, 4) + '...' : 'NOT SET');
    
    if (!JUNO_API_KEY || !JUNO_API_SECRET) {
        console.error('❌ Missing JUNO production API credentials');
        return;
    }
    
    const endpoint = `/spei/v1/clabes/${CLABE_TO_CHECK}`;
    const url = `${BASE_URL}${endpoint}`;
    const method = 'GET';
    const nonce = Date.now().toString();
    const body = ''; // No body for GET request
    
    // Build signature
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    
    console.log('\n📡 Making request to:', url);
    
    try {
        const response = await axios.get(url, { headers });
        console.log('\n✅ CLABE Status Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.payload) {
            const payload = response.data.payload;
            console.log('\n📋 CLABE Details:');
            console.log(`  - CLABE: ${payload.clabe}`);
            console.log(`  - Type: ${payload.type}`);
            console.log(`  - Status: ${payload.status}`);
            console.log(`  - Created: ${payload.created_at}`);
            
            if (payload.status === 'ENABLED') {
                console.log('\n🎉 CLABE is ENABLED - Production deposits should work!');
            } else {
                console.log('\n⚠️  CLABE Status:', payload.status);
            }
        }
        
    } catch (error) {
        console.error('\n❌ Error checking CLABE status:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Also test CLABE creation
async function testClabeCreation() {
    console.log('\n\n🔧 Testing CLABE Creation in Production');
    console.log('======================================');
    
    const endpoint = '/spei/v1/clabes';
    const url = `${BASE_URL}${endpoint}`;
    const method = 'POST';
    const nonce = Date.now().toString();
    
    const requestBody = {
        type: 'AUTO_PAYMENT',
        reference: `TEST_${Date.now()}`,
        description: 'Test CLABE creation for mainnet'
    };
    
    const body = JSON.stringify(requestBody);
    
    // Build signature
    const dataToSign = nonce + method + endpoint + body;
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    
    console.log('📡 Making CLABE creation request...');
    
    try {
        const response = await axios.post(url, requestBody, { headers });
        console.log('\n✅ CLABE Creation Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.payload) {
            const payload = response.data.payload;
            console.log('\n🎉 NEW CLABE CREATED:');
            console.log(`  - CLABE: ${payload.clabe}`);
            console.log(`  - Status: ${payload.status}`);
            console.log(`  - Reference: ${payload.reference}`);
        }
        
    } catch (error) {
        console.error('\n❌ Error creating CLABE:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

async function runTests() {
    await checkClabeStatusProd();
    await testClabeCreation();
}

runTests().catch(console.error);
