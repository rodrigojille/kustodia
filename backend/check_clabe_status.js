const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

// Payment 88's CLABE
const CLABE_TO_CHECK = '710969000000401108';

async function checkClabeStatus() {
    console.log('🔍 Checking CLABE Status in Juno');
    console.log('================================');
    console.log('CLABE:', CLABE_TO_CHECK);
    console.log('Environment:', JUNO_ENV);
    console.log('Base URL:', BASE_URL);
    
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
                console.log('\n🎉 CLABE is ENABLED - Mock deposit should work!');
                return true;
            } else {
                console.log('\n❌ CLABE is not ENABLED - This explains the mock deposit failure');
                return false;
            }
        } else {
            console.log('\n❌ Unexpected response format');
            return false;
        }
    } catch (error) {
        console.log('\n💥 Error checking CLABE:', error?.response?.data || error?.message || error);
        
        if (error?.response?.status === 404) {
            console.log('\n🚨 CLABE NOT FOUND in Juno system!');
            console.log('This explains why the mock deposit fails.');
            console.log('The CLABE may have been created incorrectly or expired.');
        }
        return false;
    }
}

checkClabeStatus().catch(console.error);
