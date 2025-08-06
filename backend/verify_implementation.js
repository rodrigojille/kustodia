const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Implementation contract details
const IMPLEMENTATION_ADDRESS = '0xbd1ecFC0b016d399b1C8CEf6AaAF9787e91F4128';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function verifyImplementation() {
  console.log('🔧 Verifying Implementation Contract...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // Find the contract source file
    const possiblePaths = [
      'contracts/KustodiaEscrow2_0Pausable.sol',
      'src/contracts/KustodiaEscrow2_0Pausable.sol',
      '../contracts/KustodiaEscrow2_0Pausable.sol'
    ];
    
    let contractPath = null;
    let sourceCode = null;
    
    for (const possiblePath of possiblePaths) {
      const fullPath = path.join(__dirname, possiblePath);
      if (fs.existsSync(fullPath)) {
        contractPath = fullPath;
        sourceCode = fs.readFileSync(fullPath, 'utf8');
        console.log('✅ Found contract source at:', fullPath);
        break;
      }
    }
    
    if (!sourceCode) {
      console.log('❌ Contract source file not found. Trying manual input...');
      console.log('\n📋 Manual Verification Instructions:');
      console.log('1. Go to: https://arbiscan.io/verifyContract?a=' + IMPLEMENTATION_ADDRESS);
      console.log('2. Select "Solidity (Single file)" or "Solidity (Standard JSON Input)"');
      console.log('3. Use these settings:');
      console.log('   - Contract Name: KustodiaEscrow2_0Pausable');
      console.log('   - Compiler Version: v0.8.20+commit.a1b79de6 (or your version)');
      console.log('   - Optimization: Yes');
      console.log('   - Runs: 200');
      console.log('   - EVM Version: paris');
      console.log('4. Upload your contract source code');
      console.log('5. Submit for verification');
      return;
    }

    // Verification parameters for implementation
    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: IMPLEMENTATION_ADDRESS,
      sourceCode: sourceCode,
      codeformat: 'solidity-single-file',
      contractname: 'KustodiaEscrow2_0Pausable',
      compilerversion: 'v0.8.20+commit.a1b79de6', // Adjust based on your compilation
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: '', // Implementation contracts usually don't have constructor args
      evmversion: 'paris',
      licenseType: '3' // MIT License
    };

    console.log('📤 Submitting implementation verification...');
    console.log('Implementation Address:', IMPLEMENTATION_ADDRESS);
    console.log('Contract Name:', verificationData.contractname);
    console.log('Compiler Version:', verificationData.compilerversion);
    
    const response = await axios.post(ARBISCAN_URL, new URLSearchParams(verificationData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('\n📥 Verification Response:');
    console.log('Status:', response.data.status);
    console.log('Message:', response.data.message);
    console.log('Result:', response.data.result);

    if (response.data.status === '1') {
      console.log('\n✅ Implementation verification submitted successfully!');
      console.log('GUID:', response.data.result);
      
      // Check verification status
      await checkVerificationStatus(response.data.result);
    } else {
      console.log('\n❌ Implementation verification failed:');
      console.log('Error:', response.data.result);
      
      // Provide manual instructions
      console.log('\n📋 Try Manual Verification:');
      console.log('1. Go to: https://arbiscan.io/verifyContract?a=' + IMPLEMENTATION_ADDRESS);
      console.log('2. Use the settings shown above');
      console.log('3. Upload your contract source code');
    }

  } catch (error) {
    console.error('❌ Error during implementation verification:', error.response?.data || error.message);
  }
}

async function checkVerificationStatus(guid) {
  console.log('\n🔄 Checking verification status...');
  
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await axios.get(ARBISCAN_URL, {
        params: {
          apikey: ARBISCAN_API_KEY,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        }
      });

      console.log(`Attempt ${attempts + 1}/${maxAttempts}:`);
      console.log('Status:', statusResponse.data.status);
      console.log('Result:', statusResponse.data.result);

      if (statusResponse.data.result === 'Pass - Verified') {
        console.log('\n🎉 IMPLEMENTATION CONTRACT SUCCESSFULLY VERIFIED!');
        console.log(`🔗 View at: https://arbiscan.io/address/${IMPLEMENTATION_ADDRESS}#code`);
        console.log('\n✨ Now your proxy contract events should display properly on Arbiscan!');
        console.log('The EscrowCreated events will show readable vertical and clabe values.');
        return;
      } else if (statusResponse.data.result.includes('Fail')) {
        console.log('\n❌ Verification failed:', statusResponse.data.result);
        return;
      }

      attempts++;
    } catch (error) {
      console.error('Error checking status:', error.message);
      attempts++;
    }
  }
  
  console.log('\n⏰ Verification status check timed out. Please check manually on Arbiscan.');
}

async function main() {
  console.log('=== KUSTODIA IMPLEMENTATION CONTRACT VERIFICATION ===\n');
  
  console.log('🎯 The Goal:');
  console.log('Verify the implementation contract so Arbiscan can properly decode');
  console.log('EscrowCreated events and show readable vertical/clabe values.\n');
  
  await verifyImplementation();
}

main().catch(console.error);
