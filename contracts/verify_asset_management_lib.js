const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Asset Management Library details
const LIBRARY_ADDRESS = '0xB712d770eedcfa4D6647fE4545CC9020A612adA4';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function verifyAssetManagementLibrary() {
  console.log('📚 Verifying Asset Management Library via API...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    console.log('Make sure you have ARBISCAN_API_KEY in your .env file');
    return;
  }

  try {
    // Read the library source code
    const SOURCE_FILE_PATH = path.join(__dirname, 'flattened', 'AssetManagementLib_flattened.sol');
    
    if (!fs.existsSync(SOURCE_FILE_PATH)) {
      console.error('❌ Library source file not found at:', SOURCE_FILE_PATH);
      return;
    }

    console.log('✅ Found library source at:', SOURCE_FILE_PATH);
    const sourceCode = fs.readFileSync(SOURCE_FILE_PATH, 'utf8');
    
    console.log('📄 Library source loaded, size:', sourceCode.length, 'characters');

    // Verification parameters for library
    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: LIBRARY_ADDRESS,
      sourceCode: sourceCode,
      codeformat: 'solidity-single-file',
      contractname: 'AssetManagementLib',
      compilerversion: 'v0.8.20+commit.a1b79de6',
      optimizationUsed: '1',
      runs: '1',
      constructorArguements: '', // Libraries don't have constructor args
      evmversion: 'shanghai',
      licenseType: '3', // MIT License
      viaIR: '1'
    };

    console.log('🚀 Submitting verification request to Arbiscan...');
    console.log('📍 Library Address:', LIBRARY_ADDRESS);
    console.log('🔧 Compiler:', verificationData.compilerversion);
    console.log('⚡ Optimization:', verificationData.optimizationUsed === '1' ? `Enabled (${verificationData.runs} runs)` : 'Disabled');

    const response = await axios.post(ARBISCAN_URL, new URLSearchParams(verificationData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('\n📡 API Response:', response.data);

    if (response.data.status === '1') {
      const guid = response.data.result;
      console.log('✅ Verification request submitted successfully!');
      console.log('🔍 Verification GUID:', guid);
      console.log('\n⏳ Checking verification status...');
      
      // Wait and check status
      await checkVerificationStatus(guid);
    } else {
      console.log('❌ Verification request failed:', response.data.result);
      
      // Check if already verified
      if (response.data.result.includes('already verified')) {
        console.log('✅ Library is already verified!');
        await checkCurrentStatus();
      }
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function checkVerificationStatus(guid) {
  const maxAttempts = 10;
  const delay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n🔄 Attempt ${attempt}/${maxAttempts}: Checking verification status...`);
      
      const statusResponse = await axios.get(ARBISCAN_URL, {
        params: {
          apikey: ARBISCAN_API_KEY,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        }
      });

      console.log('📊 Status Response:', statusResponse.data);

      if (statusResponse.data.status === '1') {
        if (statusResponse.data.result === 'Pass - Verified') {
          console.log('🎉 VERIFICATION SUCCESSFUL!');
          console.log('✅ Asset Management Library has been verified on Arbiscan');
          console.log(`🔗 View on Arbiscan: https://arbiscan.io/address/${LIBRARY_ADDRESS}#code`);
          return;
        } else if (statusResponse.data.result === 'Pending in queue') {
          console.log('⏳ Verification still pending...');
        } else {
          console.log('❌ Verification failed:', statusResponse.data.result);
          return;
        }
      } else if (statusResponse.data.status === '0' && statusResponse.data.result === 'Pending in queue') {
        console.log('⏳ Verification still pending in queue...');
      } else {
        console.log('❌ Status check failed:', statusResponse.data.result);
        return;
      }

      if (attempt < maxAttempts) {
        console.log(`⏱️  Waiting ${delay/1000} seconds before next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.error('❌ Error checking status:', error.message);
      return;
    }
  }

  console.log('⚠️  Verification status check timed out. Please check manually on Arbiscan.');
  console.log(`🔗 Check status: https://arbiscan.io/address/${LIBRARY_ADDRESS}#code`);
}

async function checkCurrentStatus() {
  try {
    console.log('\n🔍 Checking current verification status...');
    
    const response = await axios.get(ARBISCAN_URL, {
      params: {
        apikey: ARBISCAN_API_KEY,
        module: 'contract',
        action: 'getsourcecode',
        address: LIBRARY_ADDRESS
      }
    });

    if (response.data.status === '1' && response.data.result[0]) {
      const contract = response.data.result[0];
      
      if (contract.SourceCode && contract.SourceCode !== '') {
        console.log('✅ Library is verified!');
        console.log('📋 Contract Name:', contract.ContractName);
        console.log('🔧 Compiler Version:', contract.CompilerVersion);
        console.log('⚡ Optimization:', contract.OptimizationUsed === '1' ? 'Enabled' : 'Disabled');
        console.log(`🔗 View on Arbiscan: https://arbiscan.io/address/${LIBRARY_ADDRESS}#code`);
      } else {
        console.log('❌ Library is not verified yet');
      }
    } else {
      console.log('❌ Could not check verification status');
    }
  } catch (error) {
    console.error('❌ Error checking current status:', error.message);
  }
}

async function main() {
  console.log('🎯 KUSTODIA ASSET MANAGEMENT LIBRARY VERIFICATION');
  console.log('================================================');
  await verifyAssetManagementLibrary();
}

main().catch(console.error);
