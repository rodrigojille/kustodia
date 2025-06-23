require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("KustodiaEscrow2_0", function () {
  let Escrow, escrow, owner, bridge, payer, payee, other;

  beforeEach(async function () {
    [owner, bridge, payer, payee, other] = await ethers.getSigners();
    Escrow = await ethers.getContractFactory("KustodiaEscrow2_0");
    escrow = await upgrades.deployProxy(Escrow, [bridge.address], { initializer: "initialize" });
  });

  it("should set bridge wallet and owner", async function () {
    expect(await escrow.bridgeWallet()).to.equal(bridge.address);
    expect(await escrow.owner()).to.equal(owner.address);
  });

  it("should allow only bridge to create escrow", async function () {
    const deadline = Math.floor(Date.now()/1000) + 10000;
    await expect(
      escrow.connect(payer).createEscrow(payer.address, payee.address, 1000, deadline, "inmobiliaria", "646180157000001", "{}")
    ).to.be.revertedWith("Not bridge wallet");
    const tx = await escrow.connect(bridge).createEscrow(payer.address, payee.address, 1000, deadline, "inmobiliaria", "646180157000001", "{}")
    const receipt = await tx.wait();
    const escrowCreatedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === "EscrowCreated");
    if (!escrowCreatedEvent) {
      console.error("EscrowCreated event not found in receipt.logs:", receipt.logs);
    }
    expect(escrowCreatedEvent).to.exist;
    const escrowId = escrowCreatedEvent.args.escrowId;
    // escrowId can be a BigInt or BigNumber, use eq for compatibility
    expect(escrowId).to.eq(1); // primer escrow
  });

  it("should allow only bridge to fund, release, dispute, and cancel", async function () {
    // 1. Crear escrow y obtener ID
    const deadline1 = Math.floor(Date.now()/1000) + 10000;
    let tx, receipt, escrowCreatedEvent, escrowId1;
    try {
      tx = await escrow.connect(bridge).createEscrow(payer.address, payee.address, 1000, deadline1, "inmobiliaria", "646180157000001", "{}")
      receipt = await tx.wait();
    } catch (err) {
      console.error("Error creating escrow1:", err);
      throw err;
    }
    // Buscar el evento EscrowCreated en receipt.logs (ethers v6/Hardhat)
    escrowCreatedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === "EscrowCreated");
    if (!escrowCreatedEvent) {
      console.error("EscrowCreated event not found in receipt.logs:", receipt.logs);
    }
    expect(escrowCreatedEvent).to.exist;
    escrowId1 = escrowCreatedEvent.args.escrowId;
    expect(escrowId1).to.be.ok;
    // fundEscrow
    await expect(
      escrow.connect(payer).fundEscrow(escrowId1, { value: 1000 })
    ).to.be.revertedWith("Not bridge wallet");
    await expect(
      escrow.connect(bridge).fundEscrow(escrowId1, { value: 1000 })
    ).to.emit(escrow, "EscrowFunded");
    // release
    await expect(
      escrow.connect(payer).release(escrowId1)
    ).to.be.revertedWith("Not bridge wallet");
    await expect(
      escrow.connect(bridge).release(escrowId1)
    ).to.emit(escrow, "EscrowReleased");
    // 2. Crear otro escrow para dispute
    const deadline2 = Math.floor(Date.now()/1000) + 20000;
    tx = await escrow.connect(bridge).createEscrow(payer.address, payee.address, 2000, deadline2, "inmobiliaria", "646180157000002", "{}")
    receipt = await tx.wait();
    escrowCreatedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === "EscrowCreated");
    if (!escrowCreatedEvent) {
      console.error("EscrowCreated event not found in receipt.logs:", receipt.logs);
    }
    expect(escrowCreatedEvent).to.exist;
    let escrowId2 = escrowCreatedEvent.args.escrowId;
    expect(escrowId2).to.be.ok;
    await escrow.connect(bridge).fundEscrow(escrowId2, { value: 2000 });
    await expect(
      escrow.connect(payer).dispute(escrowId2, "motivo")
    ).to.be.revertedWith("Not bridge wallet");
    await expect(
      escrow.connect(bridge).dispute(escrowId2, "motivo")
    ).to.emit(escrow, "EscrowDisputed");
    // 3. Crear otro escrow para cancel
    const deadline3 = Math.floor(Date.now()/1000) + 30000;
    tx = await escrow.connect(bridge).createEscrow(payer.address, payee.address, 3000, deadline3, "inmobiliaria", "646180157000003", "{}")
    receipt = await tx.wait();
    escrowCreatedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === "EscrowCreated");
    if (!escrowCreatedEvent) {
      console.error("EscrowCreated event not found in receipt.logs:", receipt.logs);
    }
    expect(escrowCreatedEvent).to.exist;
    let escrowId3 = escrowCreatedEvent.args.escrowId;
    expect(escrowId3).to.be.ok;
    await expect(
      escrow.connect(payer).cancel(escrowId3)
    ).to.be.revertedWith("Not bridge wallet");
    await expect(
      escrow.connect(bridge).cancel(escrowId3)
    ).to.emit(escrow, "EscrowCancelled");
  });

  it("should not allow dispute after deadline", async function () {
    // Use a larger deadline to avoid "Invalid deadline" error
    const deadline = Math.floor(Date.now()/1000) + 20;
    let tx, receipt, escrowCreatedEvent, escrowId;
    try {
      tx = await escrow.connect(bridge).createEscrow(payer.address, payee.address, 4000, deadline, "inmobiliaria", "646180157000004", "{}")
      receipt = await tx.wait();
      escrowCreatedEvent = receipt.logs.find(e => e.fragment && e.fragment.name === "EscrowCreated");
      if (!escrowCreatedEvent) {
        console.error("EscrowCreated event not found in receipt.logs:", receipt.logs);
      }
      expect(escrowCreatedEvent).to.exist;
      escrowId = escrowCreatedEvent.args.escrowId;
    } catch (err) {
      console.error("Error creating escrow:", err);
      throw err;
    }
    try {
      await escrow.connect(bridge).fundEscrow(escrowId, { value: 4000 });
    } catch (err) {
      console.error("Error funding escrow:", err);
      throw err;
    }
    // Increase time
    await ethers.provider.send("evm_increaseTime", [30]);
    await ethers.provider.send("evm_mine");
    await expect(
      escrow.connect(bridge).dispute(escrowId, "late")
    ).to.be.revertedWith("Deadline passed");
  });
});
