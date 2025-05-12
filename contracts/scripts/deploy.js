async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockERC20 token (18 decimals)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("MXNB Token", "MXNB", 18);
  await mockToken.deployed();

  // Mint tokens to deployer
  await mockToken.mint(deployer.address, ethers.utils.parseEther("1000000"));

  // Deploy KustodiaEscrow with mock token and deployer as platform wallet
  const Escrow = await ethers.getContractFactory("KustodiaEscrow");
  const escrow = await Escrow.deploy(mockToken.address, deployer.address);
  await escrow.deployed();

  console.log("MockERC20 deployed to:", mockToken.address);
  console.log("KustodiaEscrow deployed to:", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
