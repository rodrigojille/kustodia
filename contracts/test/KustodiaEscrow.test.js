const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KustodiaEscrow", function () {
  let KustodiaEscrow, escrow, MXNB, mxnb, owner, buyer, seller, platform, other;

  beforeEach(async function () {
    [owner, buyer, seller, platform, other] = await ethers.getSigners();

    // Deploy a mock MXNB token (ERC20)
    MXNB = await ethers.getContractFactory("MockERC20");
    mxnb = await MXNB.deploy("MXNB Stablecoin", "MXNB", 18);
    await mxnb.deployed();

    // Mint tokens to buyer
    await mxnb.mint(buyer.address, ethers.utils.parseEther("1000"));

    // Deploy KustodiaEscrow
    KustodiaEscrow = await ethers.getContractFactory("KustodiaEscrow");
    escrow = await KustodiaEscrow.deploy(mxnb.address, platform.address);
    await escrow.deployed();
  });

  it("should create an escrow, deduct fee, and release immediate amount", async function () {
    const totalAmount = ethers.utils.parseEther("100");
    const custodyPercent = 10; // 10%
    const custodyPeriod = 60 * 60 * 24; // 1 day

    // Approve tokens to contract
    await mxnb.connect(buyer).approve(escrow.address, totalAmount);

    // Create escrow
    await expect(
      escrow.connect(buyer).createEscrow(seller.address, totalAmount, custodyPercent, custodyPeriod)
    ).to.emit(escrow, "EscrowCreated");

    // Check balances
    const fee = totalAmount.mul(15).div(1000); // 1.5%
    const custody = totalAmount.mul(custodyPercent).div(100);
    const release = totalAmount.sub(custody).sub(fee);

    expect(await mxnb.balanceOf(platform.address)).to.equal(fee);
    expect(await mxnb.balanceOf(seller.address)).to.equal(release);
    expect(await mxnb.balanceOf(escrow.address)).to.equal(custody);
  });

  it("should release custody after period by owner", async function () {
    const totalAmount = ethers.utils.parseEther("100");
    const custodyPercent = 20;
    const custodyPeriod = 1; // 1 second for test

    await mxnb.connect(buyer).approve(escrow.address, totalAmount);
    await escrow.connect(buyer).createEscrow(seller.address, totalAmount, custodyPercent, custodyPeriod);

    // Wait for custody period
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");

    // Owner releases custody
    await expect(escrow.releaseCustody(0)).to.emit(escrow, "CustodyReleased");
    // Custody amount now in seller's balance
    const custody = totalAmount.mul(custodyPercent).div(100);
    expect(await mxnb.balanceOf(seller.address)).to.equal(custody.add(totalAmount.sub(custody).sub(totalAmount.mul(15).div(1000))));
  });

  it("should allow dispute and owner to resolve", async function () {
    const totalAmount = ethers.utils.parseEther("50");
    const custodyPercent = 50;
    const custodyPeriod = 1000;

    await mxnb.connect(buyer).approve(escrow.address, totalAmount);
    await escrow.connect(buyer).createEscrow(seller.address, totalAmount, custodyPercent, custodyPeriod);

    // Buyer raises dispute
    await expect(escrow.connect(buyer).raiseDispute(0)).to.emit(escrow, "DisputeRaised");

    // Owner resolves in favor of seller
    await expect(escrow.resolveDispute(0, true)).to.emit(escrow, "DisputeResolved");
    // (Alternatively, test refund to buyer)
  });
});
