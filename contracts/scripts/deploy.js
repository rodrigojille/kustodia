const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // Load environment variables from the root .env file
  const envPath = path.resolve(__dirname, '../.env');
  require('dotenv').config({ path: envPath });

  const platformWalletAddress = process.env.BRIDGE_WALLET_ADDRESS;
  const mnxbTokenAddress = '0xF197FFC28c23E0309B5559e7a166f2c6164C80aA'; // Official MXNB Token on Arbitrum Sepolia

  if (!platformWalletAddress) {
    throw new Error('BRIDGE_WALLET_ADDRESS not found in .env file');
  }

  console.log(`Using Platform Wallet: ${platformWalletAddress}`);
  console.log(`Using MXNB Token: ${mnxbTokenAddress}`);

  // Deploy KustodiaEscrow
  const EscrowV1 = await ethers.getContractFactory('KustodiaEscrow');
  const escrowV1 = await EscrowV1.deploy(mnxbTokenAddress, platformWalletAddress);
  await escrowV1.waitForDeployment();
  console.log('KustodiaEscrow (V1) deployed to:', escrowV1.target);

  // Deploy KustodiaEscrow2_0
  const EscrowV2 = await ethers.getContractFactory('KustodiaEscrow2_0');
  const escrowV2 = await EscrowV2.deploy(); // Upgradeable contract constructor takes no arguments
  await escrowV2.waitForDeployment();
  console.log('KustodiaEscrow2_0 (V2) deployed to:', escrowV2.target);

  // Deploy KustodiaEscrow3_0
  const EscrowV3 = await ethers.getContractFactory('KustodiaEscrow3_0');
  const escrowV3 = await EscrowV3.deploy(); // Upgradeable contract constructor takes no arguments
  await escrowV3.waitForDeployment();
  console.log('KustodiaEscrow3_0 (V3) deployed to:', escrowV3.target);

  // --- Log new addresses for manual update ---
  console.log('\n\n--- COPY AND PASTE INTO YOUR .env FILE ---\n');
  console.log(`KUSTODIA_ESCROW_V1_ADDRESS=${escrowV1.target}`);
  console.log(`KUSTODIA_ESCROW_V2_ADDRESS=${escrowV2.target}`);
  console.log(`KUSTODIA_ESCROW_V3_ADDRESS=${escrowV3.target}`);
  console.log('\n-------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
