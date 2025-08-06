const axios = require('axios');
require('dotenv').config();

const PROXY_ADDRESS = '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40';
const IMPLEMENTATION_ADDRESS = '0xbd1ecFC0b016d399b1C8CEf6AaAF9787e91F4128';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;

async function checkImplementation() {
  console.log('🔍 Checking Implementation Contract Verification...\n');
  
  try {
    const response = await axios.get('https://api.arbiscan.io/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: IMPLEMENTATION_ADDRESS,
        apikey: ARBISCAN_API_KEY
      }
    });

    if (response.data.status === '1' && response.data.result[0]) {
      const result = response.data.result[0];
      
      console.log('📋 Implementation Contract Details:');
      console.log('Address:', IMPLEMENTATION_ADDRESS);
      console.log('Contract Name:', result.ContractName || 'Not verified');
      console.log('Compiler Version:', result.CompilerVersion || 'Not available');
      console.log('Optimization Used:', result.OptimizationUsed || 'Not available');
      console.log('Verification Status:', result.ABI !== 'Contract source code not verified' ? '✅ Verified' : '❌ Not verified');
      
      if (result.ABI !== 'Contract source code not verified') {
        console.log('\n✅ Implementation contract IS verified!');
        console.log(`🔗 View at: https://arbiscan.io/address/${IMPLEMENTATION_ADDRESS}#code`);
        
        // Parse ABI to check for EscrowCreated event
        try {
          const abi = JSON.parse(result.ABI);
          console.log('\n🔍 Checking ABI for EscrowCreated event...');
          
          const escrowCreatedEvent = abi.find(item => item.type === 'event' && item.name === 'EscrowCreated');
          
          if (escrowCreatedEvent) {
            console.log('✅ EscrowCreated event found!');
            console.log('Event signature:', escrowCreatedEvent.name);
            console.log('Event inputs:');
            escrowCreatedEvent.inputs.forEach((input, index) => {
              console.log(`  ${index + 1}. ${input.name}: ${input.type} ${input.indexed ? '(indexed)' : ''}`);
            });
            
            // Check for vertical and clabe specifically
            const hasVertical = escrowCreatedEvent.inputs.some(input => input.name === 'vertical');
            const hasClabe = escrowCreatedEvent.inputs.some(input => input.name === 'clabe');
            
            console.log('\n📊 Parameter Check:');
            console.log('Has vertical parameter:', hasVertical ? '✅' : '❌');
            console.log('Has clabe parameter:', hasClabe ? '✅' : '❌');
            
            if (hasVertical && hasClabe) {
              console.log('\n🎉 PERFECT! Implementation has the correct EscrowCreated event with vertical and clabe!');
            }
          } else {
            console.log('❌ EscrowCreated event NOT found in implementation ABI');
            
            // List all events
            const events = abi.filter(item => item.type === 'event');
            console.log('\n📝 Available events:');
            events.forEach(event => console.log(`  - ${event.name}`));
          }
          
          // Check for createEscrow function
          const createEscrowFunction = abi.find(item => item.type === 'function' && item.name === 'createEscrow');
          if (createEscrowFunction) {
            console.log('\n✅ createEscrow function found!');
            console.log('Function inputs:');
            createEscrowFunction.inputs.forEach((input, index) => {
              console.log(`  ${index + 1}. ${input.name}: ${input.type}`);
            });
          } else {
            console.log('\n❌ createEscrow function NOT found');
          }
          
        } catch (e) {
          console.log('❌ Could not parse ABI:', e.message);
        }
      } else {
        console.log('\n❌ Implementation contract is NOT verified');
        console.log('This is why Arbiscan cannot decode the events properly!');
        console.log(`🔧 You need to verify the implementation contract at: https://arbiscan.io/verifyContract?a=${IMPLEMENTATION_ADDRESS}`);
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('Proxy Address:', PROXY_ADDRESS, '(This is what you use in your code)');
    console.log('Implementation Address:', IMPLEMENTATION_ADDRESS, '(This needs to be verified for proper event display)');
    
  } catch (error) {
    console.error('❌ Error checking implementation:', error.message);
  }
}

checkImplementation().catch(console.error);
