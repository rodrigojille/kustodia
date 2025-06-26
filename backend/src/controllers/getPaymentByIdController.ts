import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { generatePaymentHMAC } from "../utils/hmac";

import { fetchJunoTxDetails } from '../utils/junoTxDetails';

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Missing payment id" });
      return;
    }
    const paymentRepo = ormconfig.getRepository(Payment);
    const userRepo = ormconfig.getRepository(require("../entity/User").User);
    const paymentEventRepo = ormconfig.getRepository(require("../entity/PaymentEvent").PaymentEvent);
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
    const hmac = generatePaymentHMAC({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      payer_email: payment.payer_email || '',
      recipient_email: payment.recipient_email || '',
      created_at: payment.created_at,
    });
    let junoIssuanceTxHash: string | undefined = undefined;
    let junoTimeline: any[] | undefined = undefined;
    if (payment.transaction_id) {
      try {
        const junoTx = await fetchJunoTxDetails(payment.transaction_id);
        junoTimeline = junoTx.timeline;
        const issuanceStep = junoTimeline?.find((step: any) => step.step === 'Tokens issued');
        if (issuanceStep && issuanceStep.receipt && issuanceStep.receipt.startsWith('0x')) {
          junoIssuanceTxHash = issuanceStep.receipt;
        }
      } catch (e) {
        // If Juno API fails, skip but do not block payment details
        junoTimeline = undefined;
        junoIssuanceTxHash = undefined;
      }
    }
    res.json({
      payment: {
        id: payment.id,
        status: payment.status,
        payer_email: payment.payer_email,
        recipient_email: payment.recipient_email,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        payment_type: payment.payment_type,
        vertical_type: payment.vertical_type,
        release_conditions: payment.release_conditions,
        payer_approval: payment.payer_approval,
        payee_approval: payment.payee_approval,
        payer_approval_timestamp: payment.payer_approval_timestamp,
        payee_approval_timestamp: payment.payee_approval_timestamp,
        deposit_clabe: payment.deposit_clabe,
        payout_clabe: payment.payout_clabe,
        reference: payment.reference,
        created_at: payment.created_at,
        transaction_id: payment.transaction_id, // Juno deposit ID for traceability
        blockchain_tx_hash: payment.blockchain_tx_hash, // On-chain tx hash if available
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
              // Add on-chain deadline if available
              onchain_deadline: payment.escrow?.smart_contract_escrow_id
                ? await (async () => {
                    try {
                      const escrowId = Number(payment.escrow!.smart_contract_escrow_id);
                      if (isNaN(escrowId)) return null;
                      const escrow = await require('../services/escrowService').getEscrow(escrowId);
                      return escrow.deadline?.toNumber?.() ?? null;
                    } catch (err: any) {
                      // Handle corrupted smart_contract_escrow_id data
                      console.warn(`Failed to get on-chain deadline for escrow ${payment.escrow!.id}:`, err.message);
                      return null;
                    }
                  })()
                : null
            }
          : undefined,
        recipient_deposit_clabe,
        recipient_full_name,
        hmac,
        events: (await paymentEventRepo.find({ where: { paymentId: payment.id }, order: { created_at: 'ASC' } })).map(ev => ({
          type: ev.type,
          description: ev.description,
          created_at: ev.created_at,
        })),
        juno_issuance_tx_hash: junoIssuanceTxHash,
        juno_transaction_id: payment.transaction_id,
        juno_timeline: junoTimeline
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment", details: err instanceof Error ? err.message : err });
  }
};
