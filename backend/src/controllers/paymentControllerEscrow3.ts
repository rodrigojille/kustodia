// paymentControllerEscrow3.ts
// Backend controller for wallet-based escrow flow (Flow 2.0) and event sync

import { Request, Response } from "express";
// AuthenticatedRequest adds .user from JWT
import type { AuthenticatedRequest } from '../authenticateJWT';
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { Escrow } from "../entity/Escrow";
// NOTE: Use the backup User entity with portal_share field for correct typing
import { User } from "../entity/User";
import { ethers } from "ethers";

const ESCROW3_CONTRACT_ADDRESS = process.env.ESCROW3_CONTRACT_ADDRESS;
const MXNBS_CONTRACT_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS;
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

const escrowAbi = [
  "event EscrowCreated(uint256 indexed smart_contract_escrow_id, address indexed payer, address indexed seller, uint256 amount, uint256 custodyAmount, address commission)",
  "event EscrowReleased(uint256 indexed smart_contract_escrow_id, address indexed to)",
  "event CustodyReleased(uint256 indexed smart_contract_escrow_id, address indexed to)",
  "event EscrowDisputed(uint256 indexed smart_contract_escrow_id, address indexed by)",
  "event EscrowResolved(uint256 indexed smart_contract_escrow_id, address indexed winner)"
];

// New controller for Flow 2.0: initiate wallet-based escrow payment
export const initiateEscrow3Payment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipient_email, amount, custody_percent, custody_days, commission_percent, commission_beneficiary_email, description } = req.body;
    const userRepo = ormconfig.getRepository(User);
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);

    // Validate input
    if (!recipient_email || !amount || !custody_percent || !custody_days) {
      return res.status(400).json({ error: "Missing required parameters." });
    }
    const payer = req.user; // Populated by authenticateJWT
    if (!payer) return res.status(401).json({ error: "Unauthorized" });

    // Debug: Log the user from JWT/session
    console.log("initiateEscrow3Payment: req.user", req.user);
    // Fetch payer and recipient from DB
    const payerUser = await userRepo.findOne({ where: { id: payer.id } });
    // Debug: Log the payerUser object to inspect wallet_address and portal_share
    console.log("payerUser from DB:", payerUser);
    const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
    if (!payerUser || !recipientUser) {
      return res.status(404).json({ error: "Payer or recipient not found." });
    }
    // portal_share is typed on User entity
    if (!payerUser.wallet_address || !payerUser.portal_share) {
      return res.status(400).json({ error: "Payer wallet not configured." });
    }
    if (!recipientUser.wallet_address) {
      return res.status(400).json({ error: "Recipient wallet not configured." });
    }

    // Prepare commission info
    let commission_wallet = null;
    if (commission_beneficiary_email) {
      const commissionUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
      if (!commissionUser || !commissionUser.wallet_address) {
        return res.status(400).json({ error: "Commission beneficiary wallet not configured." });
      }
      commission_wallet = commissionUser.wallet_address;
    }

    // Calculate custody and commission amounts
    const amt = Number(amount);
    const custodyAmt = Math.round((amt * Number(custody_percent)) / 100);
    const commissionAmt = commission_percent ? Math.round((amt * Number(commission_percent)) / 100) : 0;

    // Create Payment record (pending, before on-chain tx)
    const payment = paymentRepo.create({
      user: payerUser,
      recipient_email,
      payer_email: payerUser.email,
      amount: amt,
      currency: "MXNB",
      description,
      commission_percent: commission_percent ? Number(commission_percent) : undefined,
      commission_amount: commissionAmt || undefined,
      commission_beneficiary_email: commission_beneficiary_email || undefined,
      status: "pending"
    });
    await paymentRepo.save(payment);

    // Create Escrow record (pending, before on-chain tx)
    const escrow = escrowRepo.create({
      payment,
      custody_percent: Number(custody_percent),
      custody_amount: custodyAmt,
      release_amount: amt - custodyAmt - commissionAmt,
      status: "pending"
    });
    await escrowRepo.save(escrow);

    // Return info for frontend to construct on-chain tx
    res.json({
      success: true,
      payment_id: payment.id,
      escrow_id: escrow.id,
      payer_wallet: payerUser.wallet_address,
      payer_portal_share: payerUser.portal_share,
      recipient_wallet: recipientUser.wallet_address,
      commission_wallet,
      amount: amt,
      custody_amount: custodyAmt,
      commission_amount: commissionAmt,
      custody_days,
      contract: {
        address: ESCROW3_CONTRACT_ADDRESS,
        abi: escrowAbi
      },
      token: {
        address: MXNBS_CONTRACT_ADDRESS
      },
      rpc_url: ARBITRUM_SEPOLIA_RPC_URL
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// This function should be called by a backend job or webhook
export const syncEscrow3Events = async (req: Request, res: Response) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC_URL || "");
    const escrow = new ethers.Contract(ESCROW3_CONTRACT_ADDRESS || "", escrowAbi, provider);
    // 1. Get last synced block from DB or config (implement as needed)
    const fromBlock = Number(process.env.LAST_SYNCED_BLOCK || 0);
    const toBlock = await provider.getBlockNumber();
    // 2. Query EscrowCreated events
    const createdEvents = await escrow.queryFilter("EscrowCreated", fromBlock, toBlock);
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);
    for (const ev of createdEvents) {
      if (!ev.args) continue;
      const smart_contract_escrow_id = ev.args.smart_contract_escrow_id.toString();
      const payer = ev.args.payer;
      const seller = ev.args.seller;
      const amount = ev.args.amount.toString();
      const custodyAmount = ev.args.custodyAmount.toString();
      // Upsert escrow record
      let esc = await escrowRepo.findOne({ where: { smart_contract_escrow_id } });
      if (!esc) {
        // Only use fields that exist in Escrow entity
        // Map event args to correct Escrow fields
        esc = escrowRepo.create({
          smart_contract_escrow_id,
          custody_amount: custodyAmount,
          status: "funded"
        });
        await escrowRepo.save(esc);
      }
    }
    // 3. Sync other events (Released, Disputed, Resolved, CustodyReleased) similarly
    // ...
    // 4. Save last synced block
    // ...
    res.json({ success: true, count: createdEvents.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
