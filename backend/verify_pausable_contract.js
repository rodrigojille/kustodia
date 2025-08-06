const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Contract details
const CONTRACT_ADDRESS = '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40'; // Your pausable contract address
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function verifyContract() {
  console.log('🔍 Starting contract verification process...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // Read the contract source code
    const contractPath = path.join(__dirname, 'contracts/KustodiaEscrow2_0Pausable.sol');
    
    if (!fs.existsSync(contractPath)) {
      console.error('❌ Contract source file not found at:', contractPath);
      console.log('📁 Looking for contract files...');
      
      // Try to find the contract file
      const possiblePaths = [
        'src/contracts/KustodiaEscrow2_0Pausable.sol',
        'contracts/KustodiaEscrow2_0Pausable.sol',
        'src/artifacts/contracts/KustodiaEscrow2_0Pausable.sol/KustodiaEscrow2_0Pausable.sol'
      ];
      
      for (const possiblePath of possiblePaths) {
        const fullPath = path.join(__dirname, possiblePath);
        if (fs.existsSync(fullPath)) {
          console.log('✅ Found contract at:', fullPath);
          break;
        }
      }
      return;
    }

    const sourceCode = fs.readFileSync(contractPath, 'utf8');
    
    // Verification parameters
    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: CONTRACT_ADDRESS,
      sourceCode: sourceCode,
      codeformat: 'solidity-single-file',
      contractname: 'KustodiaEscrow2_0Pausable',
      compilerversion: 'v0.8.20+commit.a1b79de6', // Adjust based on your compilation
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: '', // Add if your contract has constructor arguments
      evmversion: 'paris', // or 'london', 'istanbul', etc.
      licenseType: '3' // MIT License
    };

    console.log('📤 Submitting verification request...');
    console.log('Contract Address:', CONTRACT_ADDRESS);
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
      console.log('\n✅ Verification submitted successfully!');
      console.log('GUID:', response.data.result);
      
      // Check verification status
      await checkVerificationStatus(response.data.result);
    } else {
      console.log('\n❌ Verification failed:');
      console.log('Error:', response.data.result);
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.response?.data || error.message);
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
        console.log('\n🎉 CONTRACT SUCCESSFULLY VERIFIED!');
        console.log(`🔗 View at: https://arbiscan.io/address/${CONTRACT_ADDRESS}#code`);
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

// Alternative: Get current verification status
async function getCurrentStatus() {
  try {
    console.log('🔍 Checking current contract verification status...\n');
    
    const response = await axios.get(ARBISCAN_URL, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: CONTRACT_ADDRESS,
        apikey: ARBISCAN_API_KEY
      }
    });

    if (response.data.status === '1' && response.data.result[0]) {
      const result = response.data.result[0];
      
      console.log('Contract Name:', result.ContractName || 'Not verified');
      console.log('Compiler Version:', result.CompilerVersion || 'Not available');
      console.log('Optimization Used:', result.OptimizationUsed || 'Not available');
      console.log('Source Code Available:', result.SourceCode ? 'Yes' : 'No');
      console.log('ABI Available:', result.ABI !== 'Contract source code not verified' ? 'Yes' : 'No');
      
      if (result.ABI === 'Contract source code not verified') {
        console.log('\n❌ Contract is NOT verified');
        return false;
      } else {
        console.log('\n✅ Contract is already verified!');
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking status:', error.message);
  }
  return false;
}

async function main() {
  console.log('=== KUSTODIA PAUSABLE CONTRACT VERIFICATION ===\n');
  
  const isVerified = await getCurrentStatus();
  
  if (!isVerified) {
    console.log('\n🚀 Proceeding with verification...\n');
    await verifyContract();
  } else {
    console.log('🎉 No action needed - contract is already verified!');
  }
}

main().catch(console.error);
