const { ethers } = require('ethers');
require('dotenv').config();

const PROXY_ADDRESS = '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40';
const RPC_URL = 'https://arb1.arbitrum.io/rpc';

async function findImplementation() {
  console.log('🔍 Investigating Proxy Contract...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  try {
    console.log('Proxy Address:', PROXY_ADDRESS);
    
    // ERC1967 implementation slot: keccak256("eip1967.proxy.implementation") - 1
    const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    
    // Read the implementation address from storage
    const implementationHex = await provider.getStorage(PROXY_ADDRESS, IMPLEMENTATION_SLOT);
    const implementationAddress = ethers.getAddress('0x' + implementationHex.slice(-40));
    
    console.log('✅ Implementation Address:', implementationAddress);
    
    // Check if implementation is verified
    const axios = require('axios');
    const response = await axios.get('https://api.arbiscan.io/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: implementationAddress,
        apikey: process.env.ARBISCAN_API_KEY
      }
    });
    
    if (response.data.status === '1' && response.data.result[0]) {
      const result = response.data.result[0];
      
      console.log('\n📋 Implementation Contract Details:');
      console.log('Contract Name:', result.ContractName || 'Not verified');
      console.log('Compiler Version:', result.CompilerVersion || 'Not available');
      console.log('Verification Status:', result.ABI !== 'Contract source code not verified' ? '✅ Verified' : '❌ Not verified');
      
      if (result.ABI !== 'Contract source code not verified') {
        console.log('\n🎉 Implementation contract is verified!');
        console.log(`🔗 View at: https://arbiscan.io/address/${implementationAddress}#code`);
        
        // Parse ABI to check for EscrowCreated event
        try {
          const abi = JSON.parse(result.ABI);
          const escrowCreatedEvent = abi.find(item => item.type === 'event' && item.name === 'EscrowCreated');
          
          if (escrowCreatedEvent) {
            console.log('\n✅ EscrowCreated event found in implementation ABI!');
            console.log('Event inputs:', escrowCreatedEvent.inputs.map(input => `${input.name}: ${input.type}`));
          } else {
            console.log('\n❌ EscrowCreated event NOT found in implementation ABI');
          }
        } catch (e) {
          console.log('Could not parse ABI:', e.message);
        }
      } else {
        console.log('\n❌ Implementation contract needs to be verified');
        console.log(`🔗 Verify at: https://arbiscan.io/verifyContract?a=${implementationAddress}`);
      }
    }
    
    // Test calling the implementation directly
    console.log('\n🧪 Testing contract calls...');
    
    // Load your escrow ABI
    const fs = require('fs');
    const path = require('path');
    const escrowAbiPath = path.join(__dirname, 'src/artifacts/contracts/KustodiaEscrow2_0Pausable.sol/KustodiaEscrow2_0Pausable.json');
    
    if (fs.existsSync(escrowAbiPath)) {
      const escrowAbi = JSON.parse(fs.readFileSync(escrowAbiPath, 'utf8')).abi;
      
      // Test with proxy address (should work)
      const proxyContract = new ethers.Contract(PROXY_ADDRESS, escrowAbi, provider);
      
      try {
        // Try to call a view function to test
        const escrowCount = await proxyContract.escrowCount();
        console.log('✅ Proxy call successful - Escrow count:', escrowCount.toString());
      } catch (e) {
        console.log('❌ Proxy call failed:', e.message);
      }
      
      // Test with implementation address directly (might not work due to proxy pattern)
      const implContract = new ethers.Contract(implementationAddress, escrowAbi, provider);
      
      try {
        const escrowCount = await implContract.escrowCount();
        console.log('✅ Implementation call successful - Escrow count:', escrowCount.toString());
      } catch (e) {
        console.log('❌ Implementation call failed (expected for proxy pattern):', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findImplementation().catch(console.error);
