#!/usr/bin/env node

/**
 * Production Environment Validation
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ETHEREUM_RPC_URL',
  'JUNO_API_KEY',
  'JUNO_API_SECRET',
  'ESCROW_BRIDGE_WALLET',
  'SPEI_SIGNATURE_KEY'
];

const optionalEnvVars = [
  'POSTHOG_API_KEY',
  'SENTRY_DSN',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('🔍 VALIDATING PRODUCTION ENVIRONMENT');
console.log('=' .repeat(50));

let missingRequired = [];
let missingOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingOptional.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

if (missingRequired.length > 0) {
  console.log(`\n❌ MISSING REQUIRED VARIABLES:`);
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.log(`\n⚠️  MISSING OPTIONAL VARIABLES:`);
  missingOptional.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

console.log(`\n✅ Environment validation completed`);