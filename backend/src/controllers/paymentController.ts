import { Request, Response } from "express";
import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { Escrow } from "../entity/Escrow";
import { User } from "../entity/User";
import { PaymentEvent } from "../entity/PaymentEvent";
import { createEscrow as createEscrowOnChain } from "../services/escrowService";
import { JunoTransaction } from "../entity/JunoTransaction";

export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
  try {
    const { user_id, recipient_email, amount, currency, description, custody_percent, custody_period, travel_rule_data } = req.body;
    // Basic validation
    if (!user_id || !recipient_email || !amount || !currency || !custody_percent || !custody_period) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }
    // Optional: validate travel_rule_data structure if present
    if (travel_rule_data && typeof travel_rule_data !== 'object') {
      res.status(400).json({ error: "travel_rule_data must be an object if provided." });
      return;
    }
    const userRepo = ormconfig.getRepository(User);
    const paymentRepo = ormconfig.getRepository(Payment);
    const escrowRepo = ormconfig.getRepository(Escrow);
    const user = await userRepo.findOne({ where: { id: user_id } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Fetch recipient user and their deposit_clabe
    const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
    if (!recipientUser || !recipientUser.deposit_clabe) {
      res.status(404).json({ error: "Recipient or their deposit CLABE not found" });
      return;
    }

    // Buscar payout_clabe del beneficiario de comisión si aplica
    let commission_beneficiary_clabe = undefined;
    if (req.body.commission_beneficiary_email) {
      const beneficiaryUser = await userRepo.findOne({ where: { email: req.body.commission_beneficiary_email } });
      if (!beneficiaryUser || !beneficiaryUser.payout_clabe) {
        res.status(400).json({ error: 'El beneficiario de comisión debe estar registrado y tener CLABE de retiro' });
        return;
      }
      commission_beneficiary_clabe = beneficiaryUser.payout_clabe;
    }
    // Create Payment record, associate deposit_clabe and payout_clabe
    const payment = paymentRepo.create({
      user: user as any, // typeorm expects entity or id
      recipient_email,
      payer_email: req.body.payer_email || user.email, // guarda el email del pagador si viene, si no el del usuario
      amount: Math.trunc(Number(amount)),
      currency,
      description,
      status: "pending",
      reference: '', // will update after save
      deposit_clabe: recipientUser.deposit_clabe,
      payout_clabe: recipientUser.payout_clabe || undefined,
      commission_beneficiary_name: req.body.commission_beneficiary_name,
      commission_beneficiary_email: req.body.commission_beneficiary_email,
      commission_beneficiary_clabe,
      // Store Travel Rule compliance data if provided
      travel_rule_data: travel_rule_data || null,
    });
    await paymentRepo.save(payment);
    // Registrar evento: Pago iniciado
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'initiated',
      description: 'Pago iniciado'
    }));
    // Set reference to payment.id (string) and update
    payment.reference = String(payment.id);
    await paymentRepo.save(payment);

    // Only create DB records, do NOT interact with the smart contract yet
    const custodyPercent = Number(custody_percent);
    const custodyPeriod = Number(custody_period);
    const custodyAmount = Number(amount) * (custodyPercent / 100);
    const releaseAmount = Number(amount) - custodyAmount;
    const escrow = escrowRepo.create({
      payment: payment,
      smart_contract_escrow_id: "", // Will be set after webhook
      custody_percent: custodyPercent,
      custody_amount: Math.trunc(custodyAmount),
      release_amount: Math.trunc(releaseAmount),
      status: "pending",
      dispute_status: "none",
      custody_end: new Date(Date.now() + custodyPeriod * 24 * 60 * 60 * 1000)
    });
    await escrowRepo.save(escrow);
    // NO crear evento de custodia aquí. Se creará cuando se fondeen los fondos.
    payment.status = "pending";
    payment.escrow = escrow;
    await paymentRepo.save(payment);
    res.json({ success: true, payment, escrow });
    return;
  } catch (err) {
    res.status(500).json({ error: "Payment initiation failed", details: String(err) });
    return;
  }
};

import { sendEmail } from '../utils/emailService';

// import { mintToEscrow } from '../services/erc20Service';
import { sendJunoPayment, redeemMXNbForMXN } from '../services/junoService';

export const junoWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log('==== Webhook recibido de Juno ====');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  const paymentEventRepo = ormconfig.getRepository(PaymentEvent);
  try {
    const { transaction_id, amount: webhookAmount, sender_clabe, status, clabe: webhookClabe } = req.body;
    if (!transaction_id || !webhookAmount) {
      res.status(400).json({ error: 'Missing transaction_id or amount' });
      return;
    }
    // Find a pending payment with matching reference from webhook
    // IMPORTANT: Only update payment/escrow status and amounts after webhook confirmation!
    // This ensures UI/UX only shows released/custody amounts when confirmed by Juno.
    const paymentRepo = ormconfig.getRepository(Payment);
    // Match payment by deposit_clabe, amount and status 'pending'
    const payment = await paymentRepo.findOne({
      where: {
        deposit_clabe: webhookClabe,
        amount: Number(webhookAmount),
        status: 'pending',
      },
      relations: ['user']
    });
    if (!payment) {
      console.error(`[Webhook] No matching pending payment found for deposit_clabe=${webhookClabe} and amount=${webhookAmount}`);
      res.status(404).json({ error: 'No matching pending payment found' });
      return;
    }
    // --- ENHANCED: Check deposit_clabe matches webhook clabe ---
    if (!webhookClabe || !payment.deposit_clabe || payment.deposit_clabe !== webhookClabe) {
      console.error(`[Webhook] Deposit CLABE mismatch: webhook clabe=${webhookClabe}, payment.deposit_clabe=${payment.deposit_clabe}`);
      res.status(400).json({ error: 'Deposit CLABE does not match payment record' });
      return;
    }
    // Optionally, you could also check sender_clabe if you store it in the DB
    // For now, we're matching by recipient_email and amount for demo
    // For production, add sender_clabe to Payment and match it as well.
    // --- ENHANCED LOGIC BELOW ---
    // Fetch associated escrow
    const escrowRepo = ormconfig.getRepository(Escrow);
    const escrow = await escrowRepo.findOne({ where: { payment: { id: payment.id } } });
    if (!escrow) {
      res.status(404).json({ error: 'Escrow record not found for payment' });
      return;
    }
    // Assume recipient CLABE is available on payment or user
    const recipientClabe = payment.payout_clabe || null;
    // 1. Release amount: send via Juno/Bisto
    if (escrow.release_amount > 0 && recipientClabe) {
      try {
        const payoutResult = await sendJunoPayment(recipientClabe, Number(escrow.release_amount), 'Pago liberado (no custodia)');
        console.log(`[JUNO] Sent release amount ${escrow.release_amount} to ${recipientClabe}`);
        // Registrar evento: Monto liberado
        await paymentEventRepo.save(paymentEventRepo.create({
          paymentId: payment.id,
          type: 'payout_released',
          description: ' Monto liberado al vendedor'
        }));
        // Save Bitso tracking number if available
        if (payoutResult?.payload?.tracking_number) {
          payment.bitso_tracking_number = payoutResult.payload.tracking_number;
        }
      } catch (err) {
        console.error('Error sending Juno release payment:', err);
        // Registrar evento: Redención fallida
        await paymentEventRepo.save(paymentEventRepo.create({
          paymentId: payment.id,
          type: 'redemption_failed',
          description: ' Redención fallida'
        }));
      }
    }
    // 2. Custody amount: lock in smart contract (create escrow on-chain)
    if (escrow.custody_amount > 0) {
      try {
        // FIX: Ensure custodyPercent is an integer (no decimals) for BigNumber
        const custodyPercent = Math.trunc(Number(escrow.custody_percent));
        const custodyPeriod = Math.floor((escrow.custody_end.getTime() - Date.now()) / 1000);
        if (custodyPeriod <= 0) {
          throw new Error('Custody end time must be in the future. Current custodyPeriod: ' + custodyPeriod + ' seconds.');
        }
        const sellerWallet = payment.user.wallet_address || '0x000000000000000000000000000000000000dead';
        // Convert all amounts to BigNumber (18 decimals) for contract
        const { ethers } = require("ethers");
        // Utility to safely convert DB decimal/float to string for parseUnits
        function formatAmountForUnits(val: number | string): string {
          // Always returns a string with no decimals or trailing zeros
          if (typeof val === 'string') val = Number(val);
          return Math.trunc(val).toString();
        }
        const totalAmountStr = formatAmountForUnits(payment.amount);
        const custodyAmountStr = formatAmountForUnits(escrow.custody_amount);
        const releaseAmountStr = formatAmountForUnits(escrow.release_amount);
        console.log('[DEBUG] payment.amount:', payment.amount, 'as string:', totalAmountStr);
        console.log('[DEBUG] escrow.custody_amount:', escrow.custody_amount, 'as string:', custodyAmountStr);
        console.log('[DEBUG] escrow.release_amount:', escrow.release_amount, 'as string:', releaseAmountStr);
        const totalAmount = ethers.utils.parseUnits(totalAmountStr, 6);
        const custodyAmount = ethers.utils.parseUnits(custodyAmountStr, 6);
        const releaseAmount = ethers.utils.parseUnits(releaseAmountStr, 6);
        // Use createEscrowOnChain to lock custody amount
        let escrowIdOrTx;
        try {
          escrowIdOrTx = await createEscrowOnChain({
            seller: sellerWallet,
            custodyAmount,
            custodyPeriod
          });
          console.log('[Escrow] createEscrowOnChain result:', escrowIdOrTx);
        } catch (err) {
          console.error('[Escrow] Error during createEscrowOnChain:', err);
          throw err;
        }
        // Immediate release payout to seller via Juno
        let payoutAttempted = false;
        let payoutResponse = null;
        let payoutError = null;
        // Redeem MXNb for MXN before payout
        try {
          const redemptionResponse = await redeemMXNbForMXN(releaseAmountStr, payment.travel_rule_data);
          console.log('[Juno] Redemption response:', JSON.stringify(redemptionResponse));
          if (!redemptionResponse.success) {
            // Registrar evento: Redención fallida
            await paymentEventRepo.save(paymentEventRepo.create({
              paymentId: payment.id,
              type: 'redemption_failed',
              description: ' Redención fallida'
            }));
            throw new Error('Redemption failed: ' + JSON.stringify(redemptionResponse));
          }
        } catch (redemptionErr) {
          payoutError = redemptionErr;
          console.error('[Juno] Error redeeming MXNb for MXN:', String(redemptionErr));
          // Registrar evento: Redención fallida
          await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: 'redemption_failed',
            description: ' Redención fallida'
          }));
          // Optionally: send alert or email here
        }
        // Proceed to payout only if redemption succeeded
        if (payment.payout_clabe && releaseAmount.gt(0) && !payoutError) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              payoutAttempted = true;
              payoutResponse = await sendJunoPayment(payment.payout_clabe, Number(releaseAmountStr), 'Pago Kustodia - Inmediato');
              console.log(`[Juno] Immediate payout of ${releaseAmountStr} to seller CLABE: ${payment.payout_clabe} | Attempt ${attempt}`);
              console.log('[Juno] Payout response:', JSON.stringify(payoutResponse));
              break; // Success, break out of retry loop
            } catch (junoErr) {
              payoutError = junoErr;
              console.error(`[Juno] Error sending immediate payout (attempt ${attempt}):`, String(junoErr));
              if (attempt === 3) {
                // Registrar evento: Redención fallida
                await paymentEventRepo.save(paymentEventRepo.create({
                  paymentId: payment.id,
                  type: 'redemption_failed',
                  description: ' Redención fallida'
                }));
                // Optionally: send alert or email here
                console.error('[Juno] All payout attempts failed. Manual intervention may be required.');
              } else {
                // Wait before retrying
                await new Promise(res => setTimeout(res, 2000));
              }
            }
          }
        }
        // Optionally: payout fee to platform via Juno
        // Example:
        // const platformClabe = process.env.PLATFORM_CLABE;
        // if (platformClabe && feeAmount.gt(0)) {
        //   await sendJunoPayment(platformClabe, Number(feeAmountStr), 'Kustodia Fee');
        // }
        // If createEscrowOnChain returns an object with txHash, save it; otherwise, save the string
        if (typeof escrowIdOrTx === 'object' && escrowIdOrTx !== null) {
          escrow.smart_contract_escrow_id = escrowIdOrTx.escrowId || escrowIdOrTx.txHash || '';
          escrow.blockchain_tx_hash = escrowIdOrTx.txHash || '';
          payment.blockchain_tx_hash = escrowIdOrTx.txHash || '';
        } else {
          escrow.smart_contract_escrow_id = escrowIdOrTx;
          escrow.blockchain_tx_hash = '';
          payment.blockchain_tx_hash = '';
        }
        escrow.status = 'active';
        await escrowRepo.save(escrow);
        console.log(`[Escrow] Created on-chain escrow for ${escrow.custody_amount} to ${sellerWallet} (escrowId: ${escrowIdOrTx})`);
      } catch (err) {
        console.error('Error creating on-chain escrow:', String(err));
      }
    }
    // Registrar evento: Depósito recibido
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'deposit_received',
      description: ' Depósito recibido'
    }));
    // Registrar evento: Custodia creada (cuando los fondos ya están)
    await paymentEventRepo.save(paymentEventRepo.create({
      paymentId: payment.id,
      type: 'escrow_created',
      description: '🔒 Custodia creada'
    }));
    // Notificación por email a pagador, vendedor y beneficiario de comisión (si existe)
    try {
      const { sendPaymentEventNotification } = require('../utils/paymentNotificationService');
      const recipients = [
        { email: payment.payer_email, role: 'payer' },
        { email: payment.recipient_email, role: 'seller' }
      ];
      await sendPaymentEventNotification({
        eventType: 'escrow_created',
        paymentId: payment.id.toString(),
        paymentDetails: payment,
        recipients,
        commissionBeneficiaryEmail: payment.commission_beneficiary_email || undefined
      });
    } catch (err) {
      console.error('Error enviando notificación de escrow_created:', err);
    }
    // Update payment status and link to JunoTransaction
    payment.status = 'funded';
    // Find or create JunoTransaction
    const junoTransactionRepo = ormconfig.getRepository(JunoTransaction);
    let junoTransaction = await junoTransactionRepo.findOne({ where: { reference: transaction_id } });
    if (!junoTransaction) {
      junoTransaction = junoTransactionRepo.create({
        reference: transaction_id,
        type: 'deposit',
        amount: Number(webhookAmount),
        status: status || 'completed',
      });
      await junoTransactionRepo.save(junoTransaction);
    }
    payment.junoTransaction = junoTransaction;
    await paymentRepo.save(payment);
    // Send notification emails to buyer and seller
    try {
      await sendEmail({
        to: payment.user.email,
        subject: 'Pago recibido en Kustodia',
        html: `<p>Tu pago de $${payment.amount} ha sido recibido y está en proceso.</p>`
      });
      await sendEmail({
        to: payment.recipient_email,
        subject: 'Has recibido un pago en Kustodia',
        html: `<p>Has recibido un pago de $${payment.amount}. Puedes rastrear el estado en tu panel.</p>`
      });
    } catch (emailErr) {
      // Log but do not fail webhook
      console.error('Email notification failed:', String(emailErr));
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Juno webhook error:', String(err));
    res.status(500).json({ error: 'Webhook processing failed', details: String(err) });
  }
};
