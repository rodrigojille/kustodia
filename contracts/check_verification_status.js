const axios = require('axios');
require('dotenv').config();

const LIBRARY_ADDRESS = '0xB712d770eedcfa4D6647fE4545CC9020A612adA4';
const VERIFICATION_GUID = 'gkxvimq9s9fkmpzzrfwx4anqpa8ghankmp3821cmufmjfbjpmb';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function checkStatus() {
  console.log('🔍 CHECKING ASSET MANAGEMENT LIBRARY VERIFICATION STATUS');
  console.log('======================================================');
  console.log('📍 Library Address:', LIBRARY_ADDRESS);
  console.log('🔍 Verification GUID:', VERIFICATION_GUID);
  console.log('');

  try {
    // Check verification status by GUID
    console.log('1️⃣ Checking verification status by GUID...');
    const statusResponse = await axios.get(ARBISCAN_URL, {
      params: {
        apikey: ARBISCAN_API_KEY,
        module: 'contract',
        action: 'checkverifystatus',
        guid: VERIFICATION_GUID
      }
    });

    console.log('📊 GUID Status Response:', statusResponse.data);

    if (statusResponse.data.status === '1' && statusResponse.data.result === 'Pass - Verified') {
      console.log('🎉 VERIFICATION SUCCESSFUL!');
    } else if (statusResponse.data.result === 'Pending in queue' || 
               (statusResponse.data.status === '0' && statusResponse.data.result === 'Pending in queue')) {
      console.log('⏳ Verification still pending...');
    } else {
      console.log('⚠️ Verification status:', statusResponse.data.result);
    }

    console.log('');

    // Check current contract status
    console.log('2️⃣ Checking current contract verification status...');
    const contractResponse = await axios.get(ARBISCAN_URL, {
      params: {
        apikey: ARBISCAN_API_KEY,
        module: 'contract',
        action: 'getsourcecode',
        address: LIBRARY_ADDRESS
      }
    });

    console.log('📊 Contract Status Response:', contractResponse.data);

    if (contractResponse.data.status === '1' && contractResponse.data.result[0]) {
      const contract = contractResponse.data.result[0];
      
      if (contract.SourceCode && contract.SourceCode !== '') {
        console.log('✅ LIBRARY IS VERIFIED!');
        console.log('📋 Contract Name:', contract.ContractName);
        console.log('🔧 Compiler Version:', contract.CompilerVersion);
        console.log('⚡ Optimization:', contract.OptimizationUsed === '1' ? 'Enabled' : 'Disabled');
        console.log('📄 Source Code Length:', contract.SourceCode.length, 'characters');
        console.log(`🔗 View on Arbiscan: https://arbiscan.io/address/${LIBRARY_ADDRESS}#code`);
      } else {
        console.log('❌ Library is not verified yet');
        console.log('⏳ Please wait a few more minutes and try again');
      }
    } else {
      console.log('❌ Could not check contract verification status');
    }

  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkStatus().catch(console.error);
