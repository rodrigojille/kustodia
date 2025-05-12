const { ethers } = require("hardhat");

async function main() {
  // Addresses from your deployment
  const escrowAddress = "0xCEE0890216D71E58EE97807857AA6B2b786075D9";
  const mxnbAddress = "0x357E635d1c28759D0B3e7c2201Bc10d1EBc111f0"; // Use deployed MockERC20
  const platformWallet = "0xC09b02DDb3BBCC78Fc47446D8D74E677bA8dB3E8";
  const [buyer] = await ethers.getSigners();

  // Attach contracts
  const KustodiaEscrow = await ethers.getContractAt("KustodiaEscrow", escrowAddress);
  const MXNB = await ethers.getContractAt("MockERC20", mxnbAddress);

  // Parameters
  const seller = "0x000000000000000000000000000000000000dead";
  const custodyAmount = ethers.utils.parseUnits("1", 6); // 1 MXNB (6 decimals)
  const custodyPeriod = 60; // 1 minute

  // Mint 10 MXNB to buyer for testing
  const mintTx = await MXNB.mint(buyer.address, ethers.utils.parseUnits("10", 6));
  await mintTx.wait();
  console.log("Minted 10 MXNB to buyer");

  // Print balance and allowance for debugging
  const balance = await MXNB.balanceOf(buyer.address);
  console.log("Buyer MXNB balance:", ethers.utils.formatUnits(balance, 6));
  const allowanceBefore = await MXNB.allowance(buyer.address, escrowAddress);
  console.log("Allowance before approval:", ethers.utils.formatUnits(allowanceBefore, 6));

  // 1. Approve escrow contract to spend MXNB
  const approveTx = await MXNB.approve(escrowAddress, custodyAmount);
  await approveTx.wait();
  console.log("Approved escrow contract to spend MXNB");
  const allowanceAfter = await MXNB.allowance(buyer.address, escrowAddress);
  console.log("Allowance after approval:", ethers.utils.formatUnits(allowanceAfter, 6));

  // 2. Create escrow
  const createTx = await KustodiaEscrow.createEscrow(seller, custodyAmount, custodyPeriod);
  await createTx.wait();
  console.log("Escrow created");

  // 3. Wait for custody period to end
  console.log("Waiting for custody period to end...");
  await new Promise((resolve) => setTimeout(resolve, (custodyPeriod + 5) * 1000)); // Wait a bit longer than custodyPeriod

  // 4. Release custody (as owner)
  const releaseTx = await KustodiaEscrow.releaseCustody(0); // escrowId = 0
  await releaseTx.wait();
  console.log("Custody released");

  // 5. Check platform wallet balance
  const platformBalance = await MXNB.balanceOf(platformWallet);
  console.log("Platform wallet MXNB balance:", ethers.utils.formatUnits(platformBalance, 6));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
