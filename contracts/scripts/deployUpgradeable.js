const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying upgradeable contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  // Load environment variables from the root .env file
  const envPath = path.resolve(__dirname, '../../backend/.env');
  require('dotenv').config({ path: envPath });

  // Deploy Universal Asset NFT as upgradeable
  console.log('\n=== Deploying UniversalAssetNFTUpgradeable ===');
  const UniversalAssetNFT = await ethers.getContractFactory('UniversalAssetNFTUpgradeable');
  
  const universalAssetNFT = await upgrades.deployProxy(
    UniversalAssetNFT,
    [], // initialize() has no parameters
    { 
      initializer: 'initialize',
      kind: 'uups' // Use UUPS proxy pattern
    }
  );
  
  await universalAssetNFT.waitForDeployment();
  console.log('UniversalAssetNFTUpgradeable deployed to:', universalAssetNFT.target);
  console.log('Implementation address:', await upgrades.erc1967.getImplementationAddress(universalAssetNFT.target));
  console.log('Admin address:', await upgrades.erc1967.getAdminAddress(universalAssetNFT.target));

  // Grant UPDATER_ROLE to backend wallet
  const backendWallet = '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
  const UPDATER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('UPDATER_ROLE'));
  
  console.log('\n=== Granting UPDATER_ROLE to backend wallet ===');
  const grantTx = await universalAssetNFT.grantRole(UPDATER_ROLE, backendWallet);
  await grantTx.wait();
  console.log('✅ UPDATER_ROLE granted to:', backendWallet);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    universalAssetNFT: {
      proxy: universalAssetNFT.target,
      implementation: await upgrades.erc1967.getImplementationAddress(universalAssetNFT.target),
      admin: await upgrades.erc1967.getAdminAddress(universalAssetNFT.target)
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, '../deployments', `${hre.network.name}-upgradeable.json`);
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n=== Deployment Complete ===');
  console.log('Deployment info saved to:', deploymentPath);
  console.log('\nUpdate your .env file with:');
  console.log(`UNIVERSAL_ASSET_CONTRACT_ADDRESS=${universalAssetNFT.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
