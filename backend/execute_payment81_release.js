require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 EXECUTING PAYMENT 81 COMPLETE RELEASE FLOW');
console.log('============================================');

// Check required environment variables
const requiredEnvVars = [
  'ETH_RPC_URL',
  'ESCROW_PRIVATE_KEY', 
  'ESCROW_CONTRACT_ADDRESS_2',
  'JUNO_STAGE_API_KEY',
  'JUNO_STAGE_API_SECRET',
  'JUNO_SELLER_BANK_ACCOUNT_ID'
];

console.log('🔍 Checking environment variables...');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  } else {
    console.log(`✅ ${envVar}: ${process.env[envVar].slice(0, 8)}...`);
  }
}

console.log('');
console.log('🚀 Starting TypeScript execution...');
console.log('');

// Execute the TypeScript script
const scriptPath = path.join(__dirname, 'release_payment81_complete.ts');
const tsNode = spawn('npx', ['ts-node', scriptPath], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

tsNode.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('🎉 Payment 81 release flow completed successfully!');
  } else {
    console.log('');
    console.error(`❌ Process exited with code ${code}`);
    process.exit(code);
  }
});

tsNode.on('error', (error) => {
  console.error('❌ Failed to start process:', error);
  process.exit(1);
});
