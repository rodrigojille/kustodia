const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Implementation contract details
const IMPLEMENTATION_ADDRESS = '0xbd1ecFC0b016d399b1C8CEf6AaAF9787e91F4128';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function verifyImplementationAPI() {
  console.log('🔧 Verifying Implementation Contract via API...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // Read the contract source code from the correct path
    const contractPath = path.join(__dirname, '../contracts/contracts/KustodiaEscrow2_0Pausable.sol');
    
    if (!fs.existsSync(contractPath)) {
      console.error('❌ Contract source file not found at:', contractPath);
      return;
    }

    console.log('✅ Found contract source at:', contractPath);
    const sourceCode = fs.readFileSync(contractPath, 'utf8');
    
    console.log('📄 Contract source loaded, size:', sourceCode.length, 'characters');

    // Verification parameters for implementation
    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: IMPLEMENTATION_ADDRESS,
      sourceCode: sourceCode,
      codeformat: 'solidity-single-file',
      contractname: 'KustodiaEscrow2_0Pausable',
      compilerversion: 'v0.8.20+commit.a1b79de6', // Match your deployment
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: '', // Implementation contracts don't have constructor args
      evmversion: 'paris',
      licenseType: '3' // MIT License
    };

    console.log('📤 Submitting implementation verification...');
    console.log('Implementation Address:', IMPLEMENTATION_ADDRESS);
    console.log('Contract Name:', verificationData.contractname);
    console.log('Compiler Version:', verificationData.compilerversion);
    console.log('Optimization:', verificationData.optimizationUsed === '1' ? 'Yes' : 'No');
    console.log('Runs:', verificationData.runs);
    
    const response = await axios.post(ARBISCAN_URL, new URLSearchParams(verificationData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('\n📥 Arbiscan API Response:');
    console.log('Status:', response.data.status);
    console.log('Message:', response.data.message);
    console.log('Result:', response.data.result);

    if (response.data.status === '1') {
      console.log('\n✅ Implementation verification submitted successfully!');
      console.log('Verification GUID:', response.data.result);
      
      // Check verification status
      await checkVerificationStatus(response.data.result);
    } else {
      console.log('\n❌ Implementation verification failed:');
      console.log('Error Details:', response.data.result);
      
      // Common error solutions
      if (response.data.result.includes('already verified')) {
        console.log('\n🎉 Contract is already verified! Checking current status...');
        await checkCurrentStatus();
      } else if (response.data.result.includes('compiler')) {
        console.log('\n💡 Try different compiler versions:');
        console.log('- v0.8.19+commit.7dd6d404');
        console.log('- v0.8.20+commit.a1b79de6');
        console.log('- v0.8.21+commit.d9974bed');
      }
    }

  } catch (error) {
    console.error('❌ Error during implementation verification:', error.response?.data || error.message);
  }
}

async function checkVerificationStatus(guid) {
  console.log('\n🔄 Checking verification status...');
  
  const maxAttempts = 12; // Increase attempts
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
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
        console.log('\n✨ GREAT NEWS: Your proxy contract events should now display properly!');
        console.log('🔍 Check your escrow transactions - EscrowCreated events should show:');
        console.log('   - vertical: "general" (readable text)');
        console.log('   - clabe: "710969000052950801" (readable text)');
        console.log('   - Instead of hex data!');
        return;
      } else if (statusResponse.data.result.includes('Fail')) {
        console.log('\n❌ Verification failed:', statusResponse.data.result);
        return;
      } else if (statusResponse.data.result.includes('Pending')) {
        console.log('⏳ Still processing...');
      }

      attempts++;
    } catch (error) {
      console.error('Error checking status:', error.message);
      attempts++;
    }
  }
  
  console.log('\n⏰ Verification status check timed out.');
  console.log('Please check manually at: https://arbiscan.io/address/' + IMPLEMENTATION_ADDRESS);
}

async function checkCurrentStatus() {
  try {
    const response = await axios.get(ARBISCAN_URL, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: IMPLEMENTATION_ADDRESS,
        apikey: ARBISCAN_API_KEY
      }
    });

    if (response.data.status === '1' && response.data.result[0]) {
      const result = response.data.result[0];
      
      console.log('\n📋 Current Implementation Status:');
      console.log('Contract Name:', result.ContractName || 'Not verified');
      console.log('Compiler Version:', result.CompilerVersion || 'Not available');
      console.log('Verification Status:', result.ABI !== 'Contract source code not verified' ? '✅ Verified' : '❌ Not verified');
      
      if (result.ABI !== 'Contract source code not verified') {
        console.log('\n🎉 Implementation is already verified!');
        console.log('Your proxy events should display properly on Arbiscan.');
      }
    }
  } catch (error) {
    console.error('Error checking current status:', error.message);
  }
}

async function main() {
  console.log('=== KUSTODIA IMPLEMENTATION CONTRACT API VERIFICATION ===\n');
  
  console.log('🎯 Goal: Verify implementation so proxy events display properly\n');
  
  await verifyImplementationAPI();
}

main().catch(console.error);
