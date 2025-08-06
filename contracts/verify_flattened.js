const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

// Implementation contract details
const IMPLEMENTATION_ADDRESS = '0xbd1ecFC0b016d399b1C8CEf6AaAF9787e91F4128';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function generateFlattenedContract() {
  console.log('📄 Generating flattened contract...');
  
  return new Promise((resolve, reject) => {
    exec('npx hardhat flatten contracts/KustodiaEscrow2_0Pausable.sol', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error flattening contract:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log('⚠️  Warnings:', stderr);
      }
      
      console.log('✅ Contract flattened successfully');
      console.log('📏 Flattened size:', stdout.length, 'characters');
      resolve(stdout);
    });
  });
}

async function verifyWithFlattened() {
  console.log('🔧 Verifying Implementation with Flattened Contract...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // Generate flattened contract
    const flattenedSource = await generateFlattenedContract();
    
    // Clean up the flattened source (remove duplicate SPDX and pragma statements)
    const cleanedSource = cleanFlattenedSource(flattenedSource);
    
    console.log('🧹 Cleaned flattened source, final size:', cleanedSource.length, 'characters');

    // Verification parameters using flattened source
    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: IMPLEMENTATION_ADDRESS,
      sourceCode: cleanedSource,
      codeformat: 'solidity-single-file',
      contractname: 'KustodiaEscrow2_0Pausable',
      compilerversion: 'v0.8.20+commit.a1b79de6',
      optimizationUsed: '1',
      runs: '200',
      constructorArguements: '', // Implementation contracts don't have constructor args
      evmversion: 'paris',
      licenseType: '3' // MIT License
    };

    console.log('📤 Submitting flattened contract verification...');
    console.log('Implementation Address:', IMPLEMENTATION_ADDRESS);
    console.log('Contract Name:', verificationData.contractname);
    console.log('Compiler Version:', verificationData.compilerversion);
    console.log('Optimization: Yes, Runs:', verificationData.runs);
    
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
      console.log('\n✅ Flattened contract verification submitted!');
      console.log('Verification GUID:', response.data.result);
      await checkVerificationStatus(response.data.result);
    } else {
      console.log('\n❌ Flattened verification failed:', response.data.result);
      
      if (response.data.result.includes('already verified')) {
        console.log('\n🎉 Contract is already verified!');
        await checkCurrentStatus();
      } else {
        console.log('\n💡 Manual verification fallback:');
        console.log('1. Go to: https://arbiscan.io/verifyContract?a=' + IMPLEMENTATION_ADDRESS);
        console.log('2. Select "Solidity (Single file)"');
        console.log('3. Use the flattened contract source above');
        console.log('4. Compiler: v0.8.20+commit.a1b79de6');
        console.log('5. Optimization: Yes, Runs: 200');
      }
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

function cleanFlattenedSource(source) {
  // Remove duplicate SPDX license identifiers (keep only the first one)
  const lines = source.split('\n');
  let cleanedLines = [];
  let foundSPDX = false;
  let foundPragma = false;
  
  for (let line of lines) {
    // Skip duplicate SPDX licenses
    if (line.includes('SPDX-License-Identifier')) {
      if (!foundSPDX) {
        cleanedLines.push(line);
        foundSPDX = true;
      }
      continue;
    }
    
    // Skip duplicate pragma statements (keep only the first)
    if (line.includes('pragma solidity')) {
      if (!foundPragma) {
        cleanedLines.push(line);
        foundPragma = true;
      }
      continue;
    }
    
    // Skip empty lines at the beginning
    if (cleanedLines.length === 0 && line.trim() === '') {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n');
}

async function checkVerificationStatus(guid) {
  console.log('\n🔄 Checking verification status...');
  
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
      
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
        console.log('\n🎉 IMPLEMENTATION SUCCESSFULLY VERIFIED!');
        console.log(`🔗 View at: https://arbiscan.io/address/${IMPLEMENTATION_ADDRESS}#code`);
        console.log('\n✨ GREAT NEWS: Your proxy contract events should now display properly!');
        console.log('🔍 Check your escrow transactions on Arbiscan:');
        console.log('   - EscrowCreated events should show readable text instead of hex');
        console.log('   - vertical: "general" (readable)');
        console.log('   - clabe: "710969000052950801" (readable)');
        console.log('\n🚀 Your escrow contract is now fully verified and transparent!');
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
  console.log('=== KUSTODIA FLATTENED CONTRACT VERIFICATION ===\n');
  console.log('🎯 Goal: Verify implementation so proxy events display properly\n');
  
  await verifyWithFlattened();
}

main().catch(console.error);
