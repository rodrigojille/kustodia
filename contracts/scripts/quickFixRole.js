const { ethers } = require('ethers');
require('dotenv').config({ path: '../backend/.env' });

async function grantRole() {
  try {
    console.log('🔧 Setting up connection...');
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const deployer = new ethers.Wallet(process.env.KUSTODIA_PRIVATE_KEY, provider);
    const contractAddress = process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS;
    const backendWallet = '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    
    console.log('📋 Configuration:');
    console.log('  Contract:', contractAddress);
    console.log('  Backend Wallet:', backendWallet);
    console.log('  Deployer:', deployer.address);
    
    const abi = [
      'function grantRole(bytes32 role, address account) external',
      'function hasRole(bytes32 role, address account) external view returns (bool)',
      'function getRoleAdmin(bytes32 role) external view returns (bytes32)'
    ];
    const contract = new ethers.Contract(contractAddress, abi, deployer);
    
    const UPDATER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('UPDATER_ROLE'));
    console.log('  Role Hash:', UPDATER_ROLE);
    
    // Check if role already granted
    console.log('\n🔍 Checking current role status...');
    const hasRole = await contract.hasRole(UPDATER_ROLE, backendWallet);
    console.log('  Backend wallet has UPDATER_ROLE:', hasRole);
    
    if (hasRole) {
      console.log('✅ Role already granted! Maintenance events should work now.');
      return;
    }
    
    console.log('\n🎯 Granting UPDATER_ROLE...');
    const tx = await contract.grantRole(UPDATER_ROLE, backendWallet);
    console.log('  Transaction sent:', tx.hash);
    
    console.log('⏳ Waiting for confirmation...');
    await tx.wait();
    
    // Verify the role was granted
    const hasRoleAfter = await contract.hasRole(UPDATER_ROLE, backendWallet);
    console.log('\n✅ SUCCESS!');
    console.log('  Role granted:', hasRoleAfter);
    console.log('  Transaction:', tx.hash);
    console.log('\n🎉 Maintenance events should now work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.reason) console.error('   Reason:', error.reason);
  }
}

grantRole();
