import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing payment id" });
      return;
    }
    const paymentRepo = ormconfig.getRepository(Payment);
    const userRepo = ormconfig.getRepository(require("../entity/User").User);
    const payment = await paymentRepo.findOne({ where: { id: Number(id) }, relations: ["user", "escrow"] });
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }
    // Look up recipient by recipient_email
    let recipient_deposit_clabe = undefined;
    let recipient_full_name = undefined;
    if (payment.recipient_email) {
      const recipient = await userRepo.findOne({ where: { email: payment.recipient_email } });
      if (recipient) {
        recipient_deposit_clabe = recipient.deposit_clabe;
        recipient_full_name = recipient.full_name;
      }
    }
    res.json({
      payment: {
        ...payment,
        escrow: payment.escrow
          ? {
              id: payment.escrow.id,
              custody_percent: payment.escrow.custody_percent,
              custody_amount: payment.escrow.custody_amount,
              release_amount: payment.escrow.release_amount,
              custody_end: payment.escrow.custody_end,
              created_at: payment.escrow.created_at,
              updated_at: payment.escrow.updated_at,
              status: payment.escrow.status,
              dispute_status: payment.escrow.dispute_status,
              smart_contract_escrow_id: payment.escrow.smart_contract_escrow_id,
              blockchain_tx_hash: payment.escrow.blockchain_tx_hash,
              release_tx_hash: payment.escrow.release_tx_hash,
              dispute_reason: payment.escrow.dispute_reason,
              dispute_details: payment.escrow.dispute_details,
              dispute_evidence: payment.escrow.dispute_evidence,
              dispute_history: payment.escrow.dispute_history,
            }
          : undefined,
        recipient_deposit_clabe,
        recipient_full_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment", details: err instanceof Error ? err.message : err });
  }
};
