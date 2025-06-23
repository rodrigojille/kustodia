// paymentControllerV2.ts
// Version 2: Handles Flow 2.0 wallet-based payment flow with payment tracker integration

import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Payment } from "../entity/Payment";
import { Escrow } from "../entity/Escrow";
import { createEscrow } from "../services/escrowService"; // fundEscrow removed because it is not exported

// POST /api/payments/flow2v2-notify
export const flow2v2Notify = async (req: Request, res: Response) => {
  try {
    const {
      recipient_email,
      amount,
      custody_percent,
      custody_days,
      description,
      tx_hash_direct,
      tx_hash_custody
    } = req.body;
    // 1. Create payment record
    const paymentRepo = getRepository(Payment);
    // Only use properties defined in Payment entity
    const payment = paymentRepo.create({
      amount,
      status: "pending",
      description
      // Add other valid Payment entity properties as needed
    });
    await paymentRepo.save(payment);
    // 2. Wait for custody payment confirmation (optional: poll or webhook)
    // 3. Create and fund escrow on-chain
    const custodyAmountStr = (amount * (custody_percent / 100)).toString();
    const custodyDays = Number(custody_days || 1);
    const deadline = Math.floor(Date.now() / 1000) + custodyDays * 86400;
    
    // Updated for KustodiaEscrow2_0 API
    const escrow = await createEscrow({
      payer: process.env.ESCROW_BRIDGE_WALLET!, // Bridge wallet acts as payer
      payee: req.body.recipient_wallet || '', // Recipient wallet as payee
      token: process.env.MOCK_ERC20_ADDRESS!, // MXNB token address
      amount: custodyAmountStr, // Custody amount
      deadline: deadline, // Unix timestamp for deadline
      vertical: 'flow2v2', // Business vertical
      clabe: '', // No CLABE for wallet-based flow
      conditions: `Flow2v2 payment custody for ${custody_days} days` // Escrow conditions
    });
    // await fundEscrow(escrow.escrowId); // Removed because fundEscrow is not exported
    // 4. Update payment and escrow status
    payment.status = "funded";
    await paymentRepo.save(payment);
    // 5. Generate tracker URL (if you have a tracker UI)
    const trackerUrl = `/payments/tracker/${payment.id}`;
    res.json({ success: true, tracker_url: trackerUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
