#!/usr/bin/env node

/**
 * Script to check if the escrow contract is paused and optionally unpause it
 * Usage: node check_contract_pause_status.js [--unpause]
 */

const { isContractPaused, unpauseContract, checkAndUnpauseIfNeeded } = require('./dist/services/escrowService');

async function main() {
  const args = process.argv.slice(2);
  const shouldUnpause = args.includes('--unpause');

  try {
    console.log('🔍 Checking contract pause status...');
    
    const isPaused = await isContractPaused();
    console.log(`📋 Contract paused status: ${isPaused}`);
    
    if (isPaused) {
      console.log('⚠️  Contract is currently PAUSED');
      
      if (shouldUnpause) {
        console.log('🔧 Attempting to unpause contract...');
        const txHash = await unpauseContract();
        if (txHash) {
          console.log(`✅ Contract unpaused successfully! Transaction: ${txHash}`);
        } else {
          console.log('ℹ️  Contract was already unpaused');
        }
      } else {
        console.log('💡 To unpause the contract, run: node check_contract_pause_status.js --unpause');
      }
    } else {
      console.log('✅ Contract is NOT paused - ready for escrow creation');
    }
    
  } catch (error) {
    console.error('❌ Error checking pause status:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
