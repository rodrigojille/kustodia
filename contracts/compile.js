const solc = require('solc');
const fs = require('fs');
const path = require('path');

function findImports(importPath) {
  // Handle OpenZeppelin imports
  if (importPath.startsWith('@openzeppelin/')) {
    const contractPath = path.resolve(__dirname, 'node_modules', importPath);
    if (fs.existsSync(contractPath)) {
      return { contents: fs.readFileSync(contractPath, 'utf8') };
    }
  }
  
  // Handle local imports
  const contractPath = path.resolve(__dirname, importPath);
  if (fs.existsSync(contractPath)) {
    return { contents: fs.readFileSync(contractPath, 'utf8') };
  }
  
  return { error: 'File not found' };
}

function compileContract(contractName) {
  console.log(`📄 Compiling ${contractName}...`);
  
  const contractPath = path.resolve(__dirname, `${contractName}.sol`);
  const source = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    const hasErrors = output.errors.some(error => error.severity === 'error');
    if (hasErrors) {
      console.error(`❌ Compilation errors in ${contractName}:`);
      output.errors.forEach(error => {
        if (error.severity === 'error') {
          console.error(error.formattedMessage);
        }
      });
      throw new Error(`Compilation failed for ${contractName}`);
    } else {
      // Only warnings
      console.warn(`⚠️  Compilation warnings in ${contractName}:`);
      output.errors.forEach(error => {
        console.warn(error.formattedMessage);
      });
    }
  }
  
  const contract = output.contracts[`${contractName}.sol`][contractName];
  
  if (!contract) {
    throw new Error(`Contract ${contractName} not found in compilation output`);
  }
  
  console.log(`✅ ${contractName} compiled successfully`);
  
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function compileAllContracts() {
  try {
    console.log('🔨 Starting contract compilation...\n');
    
    const contracts = ['UniversalAssetNFT', 'VehicleAssetNFT', 'PropertyAssetNFT'];
    const compiledContracts = {};
    
    for (const contractName of contracts) {
      try {
        const compiled = compileContract(contractName);
        compiledContracts[contractName] = compiled;
      } catch (error) {
        console.error(`❌ Failed to compile ${contractName}:`, error.message);
        throw error;
      }
    }
    
    // Save compiled contracts to file
    const outputPath = path.resolve(__dirname, 'compiled.json');
    fs.writeFileSync(outputPath, JSON.stringify(compiledContracts, null, 2));
    
    console.log('\n🎉 All contracts compiled successfully!');
    console.log('💾 Compiled contracts saved to compiled.json');
    
    return compiledContracts;
    
  } catch (error) {
    console.error('💥 Compilation failed:', error.message);
    process.exit(1);
  }
}

// Run compilation if this script is executed directly
if (require.main === module) {
  compileAllContracts()
    .then(() => {
      console.log('✅ Ready for deployment!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Compilation error:', error);
      process.exit(1);
    });
}

module.exports = { compileAllContracts, compileContract };
