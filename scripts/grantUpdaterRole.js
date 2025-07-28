// Script to grant UPDATER_ROLE to backend wallet
// Run this with the contract deployer's private key

const { ethers } = require('hardhat');

async function main() {
    // Contract address
    const contractAddress = process.env.UNIVERSAL_ASSET_CONTRACT_ADDRESS;
    
    // Backend wallet address that needs the role
    const backendWallet = '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    
    // Get the contract instance
    const UniversalAssetNFT = await ethers.getContractFactory('UniversalAssetNFT');
    const contract = UniversalAssetNFT.attach(contractAddress);
    
    // UPDATER_ROLE hash
    const UPDATER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('UPDATER_ROLE'));
    
    console.log('Granting UPDATER_ROLE to backend wallet...');
    console.log('Contract:', contractAddress);
    console.log('Backend Wallet:', backendWallet);
    console.log('Role Hash:', UPDATER_ROLE);
    
    // Grant the role
    const tx = await contract.grantRole(UPDATER_ROLE, backendWallet);
    await tx.wait();
    
    console.log('✅ UPDATER_ROLE granted successfully!');
    console.log('Transaction hash:', tx.hash);
    
    // Verify the role was granted
    const hasRole = await contract.hasRole(UPDATER_ROLE, backendWallet);
    console.log('✅ Role verification:', hasRole ? 'SUCCESS' : 'FAILED');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
