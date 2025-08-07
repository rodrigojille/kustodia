#!/usr/bin/env node

/**
 * Artifact Verification Script
 * Verifies that all critical contract artifacts are available in production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying contract artifacts availability...');

// Define critical contracts and libraries
const criticalContracts = [
    'KustodiaEscrow2_0Pausable',
    'KustodiaEscrow2_0',
    'UniversalAssetNFTCompact',
    'UniversalAssetNFT',
    'UniversalAssetNFTPausable',
    'PropertyAssetNFT',
    'VehicleAssetNFT',
    'MockERC20'
];

const criticalLibraries = [
    'AssetManagementLib'
];

// Check if we're in production (dist) or development (src)
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, '..', 'dist'));
const artifactsBase = isProduction ? 
    path.join(__dirname, '..', 'dist', 'artifacts') : 
    path.join(__dirname, '..', 'src', 'artifacts');

console.log(`📂 Checking artifacts in: ${artifactsBase}`);
console.log(`🏭 Environment: ${isProduction ? 'Production' : 'Development'}`);

const contractsDir = path.join(artifactsBase, 'contracts');
const librariesDir = path.join(contractsDir, 'libraries');

let allArtifactsFound = true;
let missingArtifacts = [];

// Check contracts
console.log('\n📋 Checking contract artifacts:');
criticalContracts.forEach(contractName => {
    const contractPath = path.join(contractsDir, `${contractName}.sol`, `${contractName}.json`);
    const exists = fs.existsSync(contractPath);
    
    console.log(`   ${exists ? '✅' : '❌'} ${contractName}.json`);
    
    if (!exists) {
        allArtifactsFound = false;
        missingArtifacts.push(`contracts/${contractName}.sol/${contractName}.json`);
    } else {
        // Verify the JSON is valid and has required fields
        try {
            const artifactContent = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            const hasABI = Array.isArray(artifactContent.abi);
            const hasBytecode = typeof artifactContent.bytecode === 'string';
            
            if (!hasABI || !hasBytecode) {
                console.log(`   ⚠️  ${contractName}.json exists but missing ABI or bytecode`);
            }
        } catch (error) {
            console.log(`   ⚠️  ${contractName}.json exists but is invalid JSON`);
        }
    }
});

// Check libraries
console.log('\n📚 Checking library artifacts:');
criticalLibraries.forEach(libraryName => {
    const libraryPath = path.join(librariesDir, `${libraryName}.sol`, `${libraryName}.json`);
    const exists = fs.existsSync(libraryPath);
    
    console.log(`   ${exists ? '✅' : '❌'} ${libraryName}.json`);
    
    if (!exists) {
        allArtifactsFound = false;
        missingArtifacts.push(`contracts/libraries/${libraryName}.sol/${libraryName}.json`);
    }
});

// Summary
console.log('\n📊 VERIFICATION SUMMARY:');
console.log(`   Total contracts checked: ${criticalContracts.length}`);
console.log(`   Total libraries checked: ${criticalLibraries.length}`);

if (allArtifactsFound) {
    console.log('   🎉 ALL ARTIFACTS FOUND - Production ready!');
    process.exit(0);
} else {
    console.log(`   ❌ ${missingArtifacts.length} MISSING ARTIFACTS:`);
    missingArtifacts.forEach(artifact => {
        console.log(`      - ${artifact}`);
    });
    console.log('\n💡 Run the heroku-build.js script to create missing artifacts');
    process.exit(1);
}
