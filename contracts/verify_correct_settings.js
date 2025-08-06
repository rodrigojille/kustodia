const axios = require('axios');
const { exec } = require('child_process');
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
      resolve(stdout);
    });
  });
}

function cleanFlattenedSource(source) {
  // Remove duplicate SPDX license identifiers and pragma statements
  const lines = source.split('\n');
  let cleanedLines = [];
  let foundSPDX = false;
  let foundPragma = false;
  
  for (let line of lines) {
    if (line.includes('SPDX-License-Identifier')) {
      if (!foundSPDX) {
        cleanedLines.push(line);
        foundSPDX = true;
      }
      continue;
    }
    
    if (line.includes('pragma solidity')) {
      if (!foundPragma) {
        cleanedLines.push(line);
        foundPragma = true;
      }
      continue;
    }
    
    if (cleanedLines.length === 0 && line.trim() === '') {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n');
}

async function tryVerificationWithSettings(settings) {
  console.log(`\n🔧 Trying verification with settings: ${settings.name}`);
  console.log(`   Compiler: ${settings.compiler}`);
  console.log(`   Optimization: ${settings.optimization ? 'Yes' : 'No'}`);
  console.log(`   Runs: ${settings.runs}`);
  console.log(`   EVM Version: ${settings.evmVersion}`);

  try {
    const flattenedSource = await generateFlattenedContract();
    const cleanedSource = cleanFlattenedSource(flattenedSource);

    const verificationData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: IMPLEMENTATION_ADDRESS,
      sourceCode: cleanedSource,
      codeformat: 'solidity-single-file',
      contractname: 'KustodiaEscrow2_0Pausable',
      compilerversion: settings.compiler,
      optimizationUsed: settings.optimization ? '1' : '0',
      runs: settings.runs.toString(),
      constructorArguements: '',
      evmversion: settings.evmVersion,
      licenseType: '3'
    };

    const response = await axios.post(ARBISCAN_URL, new URLSearchParams(verificationData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('📥 Response:', response.data.status, response.data.message);

    if (response.data.status === '1') {
      console.log('✅ Verification submitted! GUID:', response.data.result);
      const success = await checkVerificationStatus(response.data.result);
      return success;
    } else {
      console.log('❌ Failed:', response.data.result);
      return false;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function checkVerificationStatus(guid) {
  console.log('🔄 Checking verification status...');
  
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      const statusResponse = await axios.get(ARBISCAN_URL, {
        params: {
          apikey: ARBISCAN_API_KEY,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        }
      });

      console.log(`Attempt ${attempt}/8: ${statusResponse.data.result}`);

      if (statusResponse.data.result === 'Pass - Verified') {
        console.log('\n🎉 SUCCESS! IMPLEMENTATION CONTRACT VERIFIED!');
        console.log(`🔗 View at: https://arbiscan.io/address/${IMPLEMENTATION_ADDRESS}#code`);
        console.log('\n✨ Your proxy events should now display properly on Arbiscan!');
        return true;
      } else if (statusResponse.data.result.includes('Fail')) {
        console.log('❌ Verification failed:', statusResponse.data.result);
        return false;
      }
    } catch (error) {
      console.error('Error checking status:', error.message);
    }
  }
  
  console.log('⏰ Status check timed out');
  return false;
}

async function main() {
  console.log('=== KUSTODIA IMPLEMENTATION VERIFICATION (CORRECT SETTINGS) ===\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found');
    return;
  }

  // Try different compiler settings based on your hardhat.config.js
  const settingsToTry = [
    {
      name: 'Hardhat Config Settings (runs=1, viaIR)',
      compiler: 'v0.8.20+commit.a1b79de6',
      optimization: true,
      runs: 1,  // From your hardhat.config.js
      evmVersion: 'paris'
    },
    {
      name: 'Standard Settings (runs=200)',
      compiler: 'v0.8.20+commit.a1b79de6',
      optimization: true,
      runs: 200,
      evmVersion: 'paris'
    },
    {
      name: 'No Optimization',
      compiler: 'v0.8.20+commit.a1b79de6',
      optimization: false,
      runs: 200,
      evmVersion: 'paris'
    },
    {
      name: 'London EVM',
      compiler: 'v0.8.20+commit.a1b79de6',
      optimization: true,
      runs: 1,
      evmVersion: 'london'
    }
  ];

  for (const settings of settingsToTry) {
    const success = await tryVerificationWithSettings(settings);
    if (success) {
      console.log('\n🎯 VERIFICATION COMPLETE! Your proxy events will now display properly.');
      return;
    }
    
    console.log('\n⏭️  Trying next settings...\n');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait between attempts
  }

  console.log('\n❌ All verification attempts failed.');
  console.log('\n📋 MANUAL VERIFICATION INSTRUCTIONS:');
  console.log('1. Go to: https://arbiscan.io/verifyContract?a=' + IMPLEMENTATION_ADDRESS);
  console.log('2. Select "Solidity (Single file)"');
  console.log('3. Use the flattened contract source');
  console.log('4. Try these compiler settings:');
  console.log('   - Compiler: v0.8.20+commit.a1b79de6');
  console.log('   - Optimization: Yes, Runs: 1 (or try 200)');
  console.log('   - EVM Version: paris (or try london)');
}

main().catch(console.error);
