// Simple JavaScript execution script for Payment 83 flow
const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 EXECUTING COMPLETE PAYMENT 83 FLOW');
console.log('====================================');
console.log('This will:');
console.log('1. ✅ Withdraw 1000 MXNB from Juno → Bridge Wallet');
console.log('2. ⏳ Wait for Bridge Wallet funding');
console.log('3. 🔒 Create & fund escrow on smart contract');
console.log('4. 📝 Update Payment 83 status to ACTIVE');
console.log('');

// Execute the TypeScript script
const scriptPath = path.join(__dirname, 'scripts', 'automateJunoToEscrow_Payment83.ts');

console.log(`Executing: npx ts-node ${scriptPath}`);
console.log('Starting...\n');

const child = spawn('npx', ['ts-node', scriptPath], {
  cwd: __dirname,
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n🎉 SUCCESS! Payment 83 flow completed successfully.');
  } else {
    console.log(`\n❌ Process exited with code ${code}`);
  }
});

child.on('error', (err) => {
  console.error('❌ Error executing script:', err.message);
});
