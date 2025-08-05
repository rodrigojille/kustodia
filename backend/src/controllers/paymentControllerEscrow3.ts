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
import { getCurrentNetworkConfig } from '../utils/networkConfig';

const ESCROW3_CONTRACT_ADDRESS = process.env.KUSTODIA_ESCROW_V3_ADDRESS;

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
    const { recipient_email, amount, custody_percent, timeline, commission_percent, commission_beneficiary_email, description } = req.body;
    const userRepo = ormconfig.getRepository(User);
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);

    if (!recipient_email || !amount || !custody_percent || !timeline) {
      return res.status(400).json({ error: "Missing required parameters." });
    }
    const payer = req.user;
    if (!payer) return res.status(401).json({ error: "Unauthorized" });

    const payerUser = await userRepo.findOne({ where: { id: payer.id } });
    const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });

    if (!payerUser || !recipientUser) return res.status(404).json({ error: "Payer or recipient not found." });
    if (!payerUser.wallet_address || !payerUser.portal_share) return res.status(400).json({ error: "Payer wallet not configured." });
    if (!recipientUser.wallet_address) return res.status(400).json({ error: "Recipient wallet not configured." });

    const amt = Number(amount);
    const custodyAmt = Math.round((amt * Number(custody_percent)) / 100);

    // --- DUAL COMMISSION LOGIC ---

    // 1. Process Optional User-Defined Commission
    let userCommissionWallet = "0x0000000000000000000000000000000000000000";
    let userCommissionAmt = 0;
    if (commission_beneficiary_email && commission_percent) {
      const commissionUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
      if (commissionUser && commissionUser.wallet_address) {
        userCommissionWallet = commissionUser.wallet_address;
        userCommissionAmt = Math.round((amt * Number(commission_percent)) / 100);
      } else {
        console.warn(`User commission beneficiary ${commission_beneficiary_email} not found or has no wallet. Skipping user commission.`);
      }
    }

    // 2. Process Mandatory 2% Platform Commission
    const platformCommissionPercent = 2;
    const platformCommissionEmail = process.env.PLATFORM_COMMISSION_EMAIL;
    let platformCommissionWallet = "0x0000000000000000000000000000000000000000";
    let platformCommissionAmt = 0;
    if (platformCommissionEmail) {
      const platformUser = await userRepo.findOne({ where: { email: platformCommissionEmail } });
      if (platformUser && platformUser.wallet_address) {
        platformCommissionWallet = platformUser.wallet_address;
        platformCommissionAmt = Math.round((amt * platformCommissionPercent) / 100);
      } else {
        console.error(`CRITICAL: Platform commission beneficiary ${platformCommissionEmail} not found or has no wallet. Skipping platform commission.`);
      }
    }

    // Create Payment record
    const payment = paymentRepo.create({
      user: payerUser,
      recipient_email,
      payer_email: payerUser.email,
      amount: amt,
      currency: "MXNB",
      description,
      status: "pending",
      payment_type: 'web3',
      // 🔧 FIX: Auto-copy seller's Juno UUID to prevent field mapping bug
      payout_juno_bank_account_id: recipientUser.juno_bank_account_id || undefined,
      // User commission fields
      commission_percent: commission_percent ? Number(commission_percent) : undefined,
      commission_amount: userCommissionAmt || undefined,
      commission_beneficiary_email: commission_beneficiary_email || undefined,
      // Platform commission fields
      platform_commission_percent: platformCommissionPercent,
      platform_commission_amount: platformCommissionAmt,
      platform_commission_beneficiary_email: platformCommissionEmail,
    });
    await paymentRepo.save(payment);

    // Create Escrow record with all required fields
    const totalCommission = userCommissionAmt + platformCommissionAmt;
    const custodyEndDate = new Date();
    custodyEndDate.setDate(custodyEndDate.getDate() + Number(timeline)); // timeline in days
    
    const escrow = escrowRepo.create({
      payment,
      custody_percent: Number(custody_percent),
      custody_amount: custodyAmt,
      release_amount: amt - custodyAmt - totalCommission,
      custody_end: custodyEndDate, // Set the custody end date based on timeline
      status: "pending"
    });
    await escrowRepo.save(escrow);

    // Return info for frontend to construct on-chain tx
    res.json({
      success: true,
      payment_id: payment.id,
      escrow_id: escrow.id,
      payer_wallet: payerUser.wallet_address,
      recipient_wallet: recipientUser.wallet_address,
      amount: amt,
      custody_amount: custodyAmt,
      timeline: Number(timeline),
      // Commission details for the contract
      user_commission_beneficiary: userCommissionWallet,
      user_commission_amount: userCommissionAmt,
      platform_commission_beneficiary: platformCommissionWallet,
      platform_commission_amount: platformCommissionAmt,
      // Contract info
      contract: {
        address: ESCROW3_CONTRACT_ADDRESS,
        abi: escrowAbi
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// This function should be called by a backend job or webhook
export const syncEscrow3Events = async (req: Request, res: Response) => {
  try {
    const provider = new ethers.JsonRpcProvider(getCurrentNetworkConfig().rpcUrl);
    const escrow = new ethers.Contract(ESCROW3_CONTRACT_ADDRESS || "", escrowAbi, provider);
    // 1. Get last synced block from DB or config (implement as needed)
    const fromBlock = Number(process.env.LAST_SYNCED_BLOCK || 0);
    const toBlock = await provider.getBlockNumber();
    // 2. Query EscrowCreated events
    const createdEvents = await escrow.queryFilter("EscrowCreated", fromBlock, toBlock);
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);
    for (const ev of createdEvents) {
      const event = ev as ethers.EventLog;
      if (!event.args) continue;
      const smart_contract_escrow_id = event.args.smart_contract_escrow_id.toString();
      const payer = event.args.payer;
      const seller = event.args.seller;
      const amount = event.args.amount.toString();
      const custodyAmount = event.args.custodyAmount.toString();
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
