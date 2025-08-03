const { getEscrow } = require('../dist/services/EscrowService');

async function checkEscrowState() {
  try {
    console.log('Checking escrow #26 state on blockchain...');
    const escrowState = await getEscrow(26);
    console.log('Escrow #26 state:', escrowState);
    
    // Parse the escrow state
    console.log('\nParsed state:');
    console.log('- Payer:', escrowState[0]);
    console.log('- Payee:', escrowState[1]);
    console.log('- Token:', escrowState[2]);
    console.log('- Amount:', escrowState[3].toString());
    console.log('- Deadline:', new Date(Number(escrowState[4]) * 1000).toISOString());
    console.log('- Is Funded:', escrowState[5]);
    console.log('- Is Released:', escrowState[6]);
    console.log('- Is Disputed:', escrowState[7]);
    
  } catch (error) {
    console.error('Error checking escrow state:', error.message);
  }
}

checkEscrowState();
