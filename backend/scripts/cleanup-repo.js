#!/usr/bin/env node

/**
 * Repository Cleanup Script
 * Cleans up test files, temporary files, and organizes the repository for production
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 REPOSITORY CLEANUP - PREPARING FOR PRODUCTION');
console.log('==================================================');

const rootDir = path.join(__dirname, '..');

// Files and directories to remove
const filesToRemove = [
  // Test files in root
  'test_*.js',
  'comprehensive-auth-test.js',
  'test-export.pdf',
  
  // Test files in scripts directory
  'scripts/test-spei-receipt.pdf',
  'scripts/test-spei-receipt.html',
  'scripts/test-spei-receipt-preview.html',
  'scripts/test-spei-receipt-generation.js',
  'scripts/test-spei-api.js',
  'scripts/testSPEIReceipt.js',
  'scripts/test_withdrawal.js',
  'scripts/testPayoutMonitorE2E.js',
  'scripts/testPaymentE2E.js',
  'scripts/testEscrow.js',
  'scripts/testDisputeE2E.js',
  'scripts/testDualApproval_Payment84.ts',
  'scripts/test-nebius-api.ts',
  
  // Backup directories
  'src_backup',
];

// Files to keep (important scripts)
const filesToKeep = [
  'scripts/comprehensive-final-health-check.js',
  'scripts/check-production-health.ts',
  'scripts/cleanup-repo.js',
  'scripts/migrate-tickets.js',
  'scripts/create-escrow.js',
  'scripts/release-escrow.js',
  'scripts/process-payouts.js',
  'scripts/monitor-deposits.js',
];

function removeFile(filePath) {
  try {
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗂️  Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Removed file: ${filePath}`);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Error removing ${filePath}: ${error.message}`);
    return false;
  }
}

function removeGlobPattern(pattern) {
  try {
    const dir = path.dirname(pattern);
    const filename = path.basename(pattern);
    const fullDir = path.join(rootDir, dir === '.' ? '' : dir);
    
    if (!fs.existsSync(fullDir)) return 0;
    
    const files = fs.readdirSync(fullDir);
    let removed = 0;
    
    files.forEach(file => {
      if (filename.includes('*')) {
        const regex = new RegExp(filename.replace(/\*/g, '.*'));
        if (regex.test(file)) {
          const filePath = path.join(dir === '.' ? '' : dir, file);
          if (removeFile(filePath)) removed++;
        }
      }
    });
    
    return removed;
  } catch (error) {
    console.log(`❌ Error with pattern ${pattern}: ${error.message}`);
    return 0;
  }
}

console.log('\n1. 🗑️ Removing test and temporary files...');

let totalRemoved = 0;

filesToRemove.forEach(file => {
  if (file.includes('*')) {
    totalRemoved += removeGlobPattern(file);
  } else {
    if (removeFile(file)) totalRemoved++;
  }
});

console.log('\n2. 📁 Organizing important scripts...');

// Ensure scripts directory structure
const scriptsDir = path.join(rootDir, 'scripts');
const productionScriptsDir = path.join(scriptsDir, 'production');
const maintenanceScriptsDir = path.join(scriptsDir, 'maintenance');

[productionScriptsDir, maintenanceScriptsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created directory: ${path.relative(rootDir, dir)}`);
  }
});

// Move production-critical scripts
const productionScripts = [
  'comprehensive-final-health-check.js',
  'check-production-health.ts'
];

productionScripts.forEach(script => {
  const srcPath = path.join(scriptsDir, script);
  const destPath = path.join(productionScriptsDir, script);
  
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`📋 Copied to production: ${script}`);
  }
});

console.log('\n3. 📝 Creating production documentation...');

// Create production README
const productionReadme = `# Production Scripts

## Health Checks
- \`comprehensive-final-health-check.js\` - Complete system health validation
- \`check-production-health.ts\` - Basic production health check

## Usage
\`\`\`bash
# Run comprehensive health check
node production/comprehensive-final-health-check.js

# Run basic health check
npx ts-node production/check-production-health.ts
\`\`\`

## Monitoring
- All scripts log to console with timestamps
- Critical issues are highlighted with ❌ or ⚠️ symbols
- Success indicators use ✅ symbols
`;

fs.writeFileSync(path.join(productionScriptsDir, 'README.md'), productionReadme);
console.log('📄 Created production/README.md');

console.log('\n4. 🔍 Verifying critical files...');

const criticalFiles = [
  'src/services/speiReceiptService.ts',
  'src/routes/speiReceipt.ts',
  'src/controllers/paymentController.ts',
  '.env.example',
  'package.json',
  'tsconfig.json'
];

criticalFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Critical file present: ${file}`);
  } else {
    console.log(`❌ Missing critical file: ${file}`);
  }
});

console.log('\n5. 📊 Cleanup Summary...');

console.log(`🗑️  Files removed: ${totalRemoved}`);
console.log(`📂 Scripts organized in production/`);
console.log(`📝 Documentation updated`);

console.log('\n======================================================');
console.log('✅ REPOSITORY CLEANUP COMPLETED');
console.log('======================================================');

console.log('\n🎯 Next Steps:');
console.log('1. Review .env file for production values');
console.log('2. Update package.json scripts if needed');
console.log('3. Run final health check: node scripts/production/comprehensive-final-health-check.js');
console.log('4. Commit clean repository to version control');

console.log(`\n🕐 Completed at: ${new Date().toISOString()}`);
