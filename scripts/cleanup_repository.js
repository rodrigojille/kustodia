#!/usr/bin/env node

/**
 * 🧹 KUSTODIA REPOSITORY CLEANUP SCRIPT
 * 
 * This script organizes the repository for production deployment:
 * - Moves test files to organized directories
 * - Archives documentation properly
 * - Removes unnecessary files
 * - Prepares for production deployment
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Define cleanup actions
const cleanupPlan = {
  // Files to move to /docs/archive/
  moveToDocsArchive: [
    'CUSTODY_UI_ENHANCEMENTS_SUMMARY.md',
    'DASHBOARD_UX_PROPOSAL_2025.md',
    'DEPLOYMENT_SUCCESS_2025.md',
    'DISPUTE_FLOW_ANALYSIS.md',
    'DISPUTE_RESOLUTION_ANALYSIS.md',
    'DUAL_APPROVAL_TEST_GUIDE.md',
    'ETHERFUSE_YIELD_PROGRESS_REPORT.md',
    'FRONTEND_IMPROVEMENT_PLAN.md',
    'IMPROVEMENTS_LOG.md',
    'KUSTODIA_E2E_TRACEABILITY_COMPLETE.md',
    'KUSTODIA_PAYMENT_AUTOMATION_COMPLETE_DOCUMENTATION.md',
    'LANDING_PAGE_PROFESSIONALIZATION_PROPOSAL.md',
    'PAYMENT_AUDIT_FIXES.md',
    'PAYMENT_AUTOMATION_COMPLETE.md',
    'PAYMENT_AUTOMATION_DOCUMENTATION.md',
    'PAYMENT_FLOW_AUDIT.md',
    'PAYMENT_STATUS_DOCUMENTATION.md',
    'PAYMENT_STATUS_STANDARDIZATION.md',
    'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
    'QUICK_DEPLOYMENT_GUIDE.md',
    'TESTING_GUIDE.md'
  ],

  // Files to move to /docs/api/
  moveToDocsApi: [
    'api_documentacion.md'
  ],

  // Files to keep in root (production essential)
  keepInRoot: [
    'README.md',
    'MXNB_HACKATHON_SUBMISSION_2025.md',
    'roadmap_epics.md'
  ],

  // Files/folders to remove completely
  removeCompletely: [
    'bfg-1.14.0.jar',
    'compare_bytecode.py',
    'debug_payment.js',
    'test_new_payment.json',
    'data.json',
    'git',
    'original_nuevo_flujo.txt',
    'replacements.txt',
    '.venv',
    'frontend-legacy'
  ],

  // Test files to move to /tests/
  moveToTests: [
    // Backend test files (will be identified dynamically)
  ]
};

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

function moveFile(source, destination) {
  try {
    const destDir = path.dirname(destination);
    createDirectory(destDir);
    
    if (fs.existsSync(source)) {
      fs.renameSync(source, destination);
      console.log(`📁 Moved: ${source} → ${destination}`);
      return true;
    } else {
      console.log(`⚠️  File not found: ${source}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error moving ${source}:`, error.message);
    return false;
  }
}

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(`🗑️  Removed: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  File/folder not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message);
    return false;
  }
}

function cleanupRepository() {
  console.log('🧹 STARTING KUSTODIA REPOSITORY CLEANUP...\n');

  // Create necessary directories
  console.log('📁 Creating organizational directories...');
  createDirectory(path.join(rootDir, 'docs', 'archive'));
  createDirectory(path.join(rootDir, 'docs', 'api'));
  createDirectory(path.join(rootDir, 'tests', 'backend'));
  createDirectory(path.join(rootDir, 'tests', 'scripts'));

  // Move documentation to docs/archive/
  console.log('\n📚 Moving documentation to archive...');
  cleanupPlan.moveToDocsArchive.forEach(file => {
    const source = path.join(rootDir, file);
    const dest = path.join(rootDir, 'docs', 'archive', file);
    moveFile(source, dest);
  });

  // Move API docs
  console.log('\n📋 Moving API documentation...');
  cleanupPlan.moveToDocsApi.forEach(file => {
    const source = path.join(rootDir, file);
    const dest = path.join(rootDir, 'docs', 'api', file);
    moveFile(source, dest);
  });

  // Move backend test files
  console.log('\n🧪 Moving test files...');
  const backendDir = path.join(rootDir, 'backend');
  const testFiles = fs.readdirSync(backendDir)
    .filter(file => file.startsWith('test') && file.endsWith('.js'));
  
  testFiles.forEach(file => {
    const source = path.join(backendDir, file);
    const dest = path.join(rootDir, 'tests', 'backend', file);
    moveFile(source, dest);
  });

  // Move script tests
  const scriptsDir = path.join(rootDir, 'backend', 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const scriptTestFiles = fs.readdirSync(scriptsDir)
      .filter(file => file.startsWith('test') && file.endsWith('.js'));
    
    scriptTestFiles.forEach(file => {
      const source = path.join(scriptsDir, file);
      const dest = path.join(rootDir, 'tests', 'scripts', file);
      moveFile(source, dest);
    });
  }

  // Remove unnecessary files
  console.log('\n🗑️  Removing unnecessary files...');
  cleanupPlan.removeCompletely.forEach(item => {
    const itemPath = path.join(rootDir, item);
    removeFile(itemPath);
  });

  console.log('\n✅ REPOSITORY CLEANUP COMPLETED!');
  console.log('\n📊 Summary:');
  console.log('   📁 Organized documentation into /docs/');
  console.log('   🧪 Moved test files to /tests/');
  console.log('   🗑️  Removed development artifacts');
  console.log('   🚀 Repository is now production-ready!');
}

if (require.main === module) {
  cleanupRepository();
}

module.exports = { cleanupRepository };
