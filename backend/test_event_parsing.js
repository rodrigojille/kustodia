const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load the pausable contract ABI
const pausableAbiPath = path.join(__dirname, 'src/artifacts/contracts/KustodiaEscrow2_0Pausable.sol/KustodiaEscrow2_0Pausable.json');
const pausableAbi = JSON.parse(fs.readFileSync(pausableAbiPath, 'utf8')).abi;

// Load the regular contract ABI for comparison
const regularAbiPath = path.join(__dirname, 'src/artifacts/contracts/KustodiaEscrow2_0.sol/KustodiaEscrow2_0.json');
const regularAbi = JSON.parse(fs.readFileSync(regularAbiPath, 'utf8')).abi;

async function testEventParsing() {
  console.log('=== Testing Event Parsing ===\n');
  
  // Create interfaces for both contracts
  const pausableInterface = new ethers.Interface(pausableAbi);
  const regularInterface = new ethers.Interface(regularAbi);
  
  // Your actual mainnet transaction hash
  const txHash = '0x09d2f840df34e8068430d8529add205deda9872c388ccbb02973be6780860463';
  
  // Connect to Arbitrum mainnet
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  
  try {
    console.log('Fetching transaction receipt...');
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log('Transaction not found!');
      return;
    }
    
    console.log(`Found ${receipt.logs.length} logs in transaction\n`);
    
    // Test parsing with pausable contract interface
    console.log('=== TESTING WITH PAUSABLE CONTRACT ABI ===');
    let foundWithPausable = false;
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      try {
        const parsedLog = pausableInterface.parseLog(log);
        if (parsedLog && parsedLog.name === 'EscrowCreated') {
          foundWithPausable = true;
          console.log('✅ Found EscrowCreated event with PAUSABLE ABI:');
          console.log('Event args:', {
            escrowId: parsedLog.args.escrowId?.toString(),
            payer: parsedLog.args.payer,
            payee: parsedLog.args.payee,
            amount: parsedLog.args.amount?.toString(),
            vertical: parsedLog.args.vertical,
            clabe: parsedLog.args.clabe
          });
          break;
        }
      } catch (e) {
        // Skip unparseable logs
      }
    }
    
    if (!foundWithPausable) {
      console.log('❌ No EscrowCreated event found with pausable ABI');
    }
    
    console.log('\n=== TESTING WITH REGULAR CONTRACT ABI ===');
    let foundWithRegular = false;
    
    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      try {
        const parsedLog = regularInterface.parseLog(log);
        if (parsedLog && parsedLog.name === 'EscrowCreated') {
          foundWithRegular = true;
          console.log('✅ Found EscrowCreated event with REGULAR ABI:');
          console.log('Event args:', {
            escrowId: parsedLog.args.escrowId?.toString(),
            payer: parsedLog.args.payer,
            payee: parsedLog.args.payee,
            amount: parsedLog.args.amount?.toString(),
            vertical: parsedLog.args.vertical,
            clabe: parsedLog.args.clabe
          });
          break;
        }
      } catch (e) {
        // Skip unparseable logs
      }
    }
    
    if (!foundWithRegular) {
      console.log('❌ No EscrowCreated event found with regular ABI');
    }
    
    // Show raw log data for manual inspection
    console.log('\n=== RAW LOG DATA ===');
    receipt.logs.forEach((log, index) => {
      console.log(`Log ${index}:`);
      console.log(`  Address: ${log.address}`);
      console.log(`  Topics: ${log.topics}`);
      console.log(`  Data: ${log.data}`);
      console.log('');
    });
    
    // Compare EscrowCreated event signatures
    console.log('\n=== EVENT SIGNATURES COMPARISON ===');
    
    const pausableEvents = pausableAbi.filter(item => item.type === 'event' && item.name === 'EscrowCreated');
    const regularEvents = regularAbi.filter(item => item.type === 'event' && item.name === 'EscrowCreated');
    
    console.log('Pausable contract EscrowCreated events:', pausableEvents.length);
    pausableEvents.forEach((event, i) => {
      console.log(`  Event ${i}:`, JSON.stringify(event, null, 2));
    });
    
    console.log('\nRegular contract EscrowCreated events:', regularEvents.length);
    regularEvents.forEach((event, i) => {
      console.log(`  Event ${i}:`, JSON.stringify(event, null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEventParsing().catch(console.error);
