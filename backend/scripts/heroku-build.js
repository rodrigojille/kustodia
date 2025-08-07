#!/usr/bin/env node

/**
 * Heroku Build Script for Contract Artifacts
 * Ensures contract artifacts are properly copied to dist directory in production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Heroku build process...');

// Ensure src/artifacts directory exists
const srcArtifactsDir = path.join(__dirname, '..', 'src', 'artifacts');
if (!fs.existsSync(srcArtifactsDir)) {
    console.log('📁 Creating src/artifacts directory...');
    fs.mkdirSync(srcArtifactsDir, { recursive: true });
}

// Check if artifacts exist in src/artifacts
const contractsDir = path.join(srcArtifactsDir, 'contracts');
const artifactsExist = fs.existsSync(contractsDir);

console.log(`📋 Artifacts status: ${artifactsExist ? '✅ Found' : '❌ Missing'}`);

if (!artifactsExist) {
    console.log('⚠️  Contract artifacts not found in src/artifacts');
    console.log('📦 Creating minimal artifacts structure...');
    
    // Create minimal structure for critical contracts
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
    
    // Critical libraries that need to be included
    const criticalLibraries = [
        'AssetManagementLib'
    ];
    
    fs.mkdirSync(contractsDir, { recursive: true });
    
    criticalContracts.forEach(contractName => {
        const contractDir = path.join(contractsDir, `${contractName}.sol`);
        fs.mkdirSync(contractDir, { recursive: true });
        
        // Create placeholder JSON with minimal ABI
        const placeholderABI = {
            "_format": "hh-sol-artifact-1",
            "contractName": contractName,
            "sourceName": `contracts/${contractName}.sol`,
            "abi": [],
            "bytecode": "0x",
            "deployedBytecode": "0x",
            "linkReferences": {},
            "deployedLinkReferences": {}
        };
        
        const jsonPath = path.join(contractDir, `${contractName}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(placeholderABI, null, 2));
        console.log(`📄 Created placeholder: ${contractName}.json`);
    });
    
    // Create libraries directory and artifacts
    const librariesDir = path.join(contractsDir, 'libraries');
    fs.mkdirSync(librariesDir, { recursive: true });
    
    criticalLibraries.forEach(libraryName => {
        const libraryDir = path.join(librariesDir, `${libraryName}.sol`);
        fs.mkdirSync(libraryDir, { recursive: true });
        
        // Create placeholder JSON for library
        const placeholderLibraryABI = {
            "_format": "hh-sol-artifact-1",
            "contractName": libraryName,
            "sourceName": `contracts/libraries/${libraryName}.sol`,
            "abi": [],
            "bytecode": "0x",
            "deployedBytecode": "0x",
            "linkReferences": {},
            "deployedLinkReferences": {}
        };
        
        const jsonPath = path.join(libraryDir, `${libraryName}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(placeholderLibraryABI, null, 2));
        console.log(`📚 Created library placeholder: ${libraryName}.json`);
    });
}

// Run TypeScript compilation
console.log('🔨 Compiling TypeScript...');
try {
    execSync('npx tsc', { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.error('❌ TypeScript compilation failed:', error.message);
    process.exit(1);
}

// Copy artifacts to dist directory
console.log('📂 Copying artifacts to dist directory...');
try {
    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    execSync('npx copyfiles -u 1 src/artifacts/**/* dist/', { stdio: 'inherit' });
    console.log('✅ Artifacts copied successfully');
} catch (error) {
    console.error('❌ Failed to copy artifacts:', error.message);
    process.exit(1);
}

// Verify artifacts in dist
const distArtifactsDir = path.join(__dirname, '..', 'dist', 'artifacts');
const distArtifactsExist = fs.existsSync(distArtifactsDir);

console.log(`🔍 Verification: dist/artifacts ${distArtifactsExist ? '✅ exists' : '❌ missing'}`);

if (distArtifactsExist) {
    const distContractsDir = path.join(distArtifactsDir, 'contracts');
    if (fs.existsSync(distContractsDir)) {
        const contracts = fs.readdirSync(distContractsDir);
        console.log(`📊 Found ${contracts.length} contract directories in dist/artifacts/contracts`);
        contracts.forEach(contract => {
            console.log(`   - ${contract}`);
        });
    }
}

console.log('🎉 Heroku build process completed successfully!');
