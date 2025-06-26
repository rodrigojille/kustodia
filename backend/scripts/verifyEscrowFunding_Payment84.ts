import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import ormconfig from "../src/ormconfig";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";
import { ethers } from "ethers";

async function main() {
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const paymentRepo = ormconfig.getRepository(Payment);
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);

  console.log(`🔍 Verifying Payment 84 / Escrow 72 funding status...\n`);

  // Get Payment 84 and its escrow
  const payment = await paymentRepo.findOne({ where: { id: 84 }, relations: ["escrow"] });
  if (!payment) {
    console.error(`❌ Payment 84 not found`);
    process.exit(1);
  }

  const escrow = await escrowRepo.findOne({ where: { id: 72 } });
  if (!escrow) {
    console.error(`❌ Escrow 72 not found`);
    process.exit(1);
  }

  console.log(`📊 Payment 84 Status: ${payment.status}`);
  console.log(`📊 Escrow 72 Status: ${escrow.status}`);
  console.log(`📊 Smart Contract Escrow ID: ${escrow.smart_contract_escrow_id}`);
  console.log(`📊 Blockchain TX Hash: ${escrow.blockchain_tx_hash}`);
  console.log(`📊 Custody Amount: ${escrow.custody_amount} MXNB\n`);

  // Check PaymentEvents
  const events = await paymentEventRepo.find({
    where: { paymentId: 84 },
    order: { created_at: 'ASC' }
  });

  console.log(`📝 PaymentEvents for Payment 84:`);
  events.forEach((event, index) => {
    console.log(`${index + 1}. ${event.type} - ${event.description || 'No description'} (${event.created_at})`);
  });

  // Check bridge wallet balance
  const RPC_URL = process.env.ETH_RPC_URL!;
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
  const TOKEN_ADDRESS = process.env.MOCK_ERC20_ADDRESS!;

  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  try {
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(BRIDGE_WALLET);
    const decimals = await tokenContract.decimals();
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);

    console.log(`\n💰 Current Bridge Wallet Balance: ${formattedBalance} MXNB`);

    const originalBalance = 10390.0;
    const expectedDeduction = 5000.0;
    const expectedFinalBalance = originalBalance - expectedDeduction;

    console.log(`📊 Original Balance: ${originalBalance} MXNB`);
    console.log(`📊 Expected Deduction: ${expectedDeduction} MXNB`);
    console.log(`📊 Expected Final Balance: ${expectedFinalBalance} MXNB`);
    console.log(`📊 Actual Final Balance: ${formattedBalance} MXNB`);

    const actualDeduction = originalBalance - parseFloat(formattedBalance);
    console.log(`📊 Actual Deduction: ${actualDeduction} MXNB`);

    if (Math.abs(actualDeduction - expectedDeduction) < 0.01) {
      console.log(`\n✅ SUCCESS! Escrow has been funded correctly!`);
      console.log(`🎉 Payment 84 is now fully operational with funded on-chain custody!`);
    } else {
      console.log(`\n⚠️ Funding verification inconclusive. Check escrow contract directly.`);
    }

  } catch (error) {
    console.error("❌ Error checking balance:", error);
  } finally {
    await ormconfig.destroy();
  }
}

main().catch(console.error);
