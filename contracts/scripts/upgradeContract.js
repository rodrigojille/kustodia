const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Upgrading contract with the account:', deployer.address);

  // Load current deployment info
  const deploymentPath = path.join(__dirname, '../deployments', `${hre.network.name}-upgradeable.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found: ${deploymentPath}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const proxyAddress = deploymentInfo.universalAssetNFT.proxy;
  
  console.log('Current proxy address:', proxyAddress);
  console.log('Current implementation:', deploymentInfo.universalAssetNFT.implementation);

  // Deploy new implementation
  console.log('\n=== Deploying new implementation ===');
  const UniversalAssetNFTV2 = await ethers.getContractFactory('UniversalAssetNFTUpgradeable');
  
  const upgraded = await upgrades.upgradeProxy(proxyAddress, UniversalAssetNFTV2);
  await upgraded.waitForDeployment();
  
  const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log('✅ Contract upgraded successfully!');
  console.log('New implementation address:', newImplementation);
  console.log('Proxy address remains:', proxyAddress);

  // Update deployment info
  deploymentInfo.universalAssetNFT.implementation = newImplementation;
  deploymentInfo.lastUpgrade = new Date().toISOString();
  deploymentInfo.upgradeHistory = deploymentInfo.upgradeHistory || [];
  deploymentInfo.upgradeHistory.push({
    timestamp: new Date().toISOString(),
    implementation: newImplementation,
    upgrader: deployer.address
  });

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log('Deployment info updated');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
