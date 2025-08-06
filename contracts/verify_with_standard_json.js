const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Implementation contract details
const IMPLEMENTATION_ADDRESS = '0xbd1ecFC0b016d399b1C8CEf6AaAF9787e91F4128';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_URL = 'https://api.arbiscan.io/api';

async function verifyWithStandardJSON() {
  console.log('🔧 Verifying Implementation with Standard JSON Input...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // First, let's try to generate the Standard JSON from compilation artifacts
    const artifactPath = path.join(__dirname, 'artifacts/contracts/KustodiaEscrow2_0Pausable.sol/KustodiaEscrow2_0Pausable.json');
    
    if (!fs.existsSync(artifactPath)) {
      console.log('❌ Compiled artifact not found. Let me provide manual instructions...');
      await provideManualInstructions();
      return;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Check if we have the standard input in the artifact
    if (artifact.metadata) {
      const metadata = JSON.parse(artifact.metadata);
      console.log('✅ Found compilation metadata');
      
      // Create Standard JSON Input
      const standardInput = {
        language: "Solidity",
        sources: metadata.sources,
        settings: metadata.settings
      };

      console.log('📄 Standard JSON Input created');
      console.log('Sources:', Object.keys(standardInput.sources).length, 'files');

      // Verification parameters using Standard JSON
      const verificationData = {
        apikey: ARBISCAN_API_KEY,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: IMPLEMENTATION_ADDRESS,
        sourceCode: JSON.stringify(standardInput),
        codeformat: 'solidity-standard-json-input',
        contractname: 'contracts/KustodiaEscrow2_0Pausable.sol:KustodiaEscrow2_0Pausable',
        compilerversion: metadata.compiler.version,
        constructorArguements: '',
        licenseType: '3'
      };

      console.log('📤 Submitting Standard JSON verification...');
      console.log('Implementation Address:', IMPLEMENTATION_ADDRESS);
      console.log('Contract Name:', verificationData.contractname);
      console.log('Compiler Version:', verificationData.compilerversion);
      
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
        console.log('\n✅ Standard JSON verification submitted!');
        await checkVerificationStatus(response.data.result);
      } else {
        console.log('\n❌ Standard JSON verification failed:', response.data.result);
        await provideManualInstructions();
      }

    } else {
      console.log('❌ No metadata found in artifact');
      await provideManualInstructions();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await provideManualInstructions();
  }
}

async function provideManualInstructions() {
  console.log('\n📋 MANUAL VERIFICATION INSTRUCTIONS:');
  console.log('Since automated verification failed, please verify manually:\n');
  
  console.log('1. 🌐 Go to: https://arbiscan.io/verifyContract?a=' + IMPLEMENTATION_ADDRESS);
  console.log('\n2. 📝 Select "Solidity (Standard JSON Input)"');
  console.log('\n3. ⚙️  Use these settings:');
  console.log('   - Contract Name: contracts/KustodiaEscrow2_0Pausable.sol:KustodiaEscrow2_0Pausable');
  console.log('   - Compiler Version: v0.8.20+commit.a1b79de6');
  console.log('   - License Type: MIT License (3)');
  
  console.log('\n4. 📁 For the Standard JSON Input, you need to:');
  console.log('   a) Run: npx hardhat flatten contracts/KustodiaEscrow2_0Pausable.sol > flattened.sol');
  console.log('   b) Or use the Standard JSON from your compilation artifacts');
  console.log('   c) Or copy all the OpenZeppelin contract sources manually');
  
  console.log('\n5. 🚀 Alternative - Use Hardhat Verify Plugin:');
  console.log('   npx hardhat verify --network arbitrum ' + IMPLEMENTATION_ADDRESS);
  
  console.log('\n6. ✅ Once verified, your proxy events will display properly!');
}

async function checkVerificationStatus(guid) {
  console.log('\n🔄 Checking verification status...');
  
  const maxAttempts = 8;
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
        console.log('\n✨ Your proxy contract events should now display properly!');
        return;
      } else if (statusResponse.data.result.includes('Fail')) {
        console.log('\n❌ Verification failed:', statusResponse.data.result);
        await provideManualInstructions();
        return;
      }

      attempts++;
    } catch (error) {
      console.error('Error checking status:', error.message);
      attempts++;
    }
  }
  
  console.log('\n⏰ Status check timed out.');
}

async function main() {
  console.log('=== KUSTODIA STANDARD JSON VERIFICATION ===\n');
  await verifyWithStandardJSON();
}

main().catch(console.error);
