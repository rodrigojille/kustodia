import { Request, Response } from 'express';
import AppDataSource from '../ormconfig'; // CORRECTED IMPORT PATH
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { JunoTransaction } from '../entity/JunoTransaction';
import { AuthenticatedRequest } from '../AuthenticatedRequest';
import { createNotification } from '../services/notificationService';
import { createV3Escrow, fundV3Escrow, releaseV3Escrow } from '../services/escrowV3Service';
import { signAndBroadcastWithPortal } from '../services/portalSignerService';
import { ethers } from 'ethers';

// Helper function to create a payment event
const createPaymentEvent = async (payment: Payment, type: string, description: string, isAutomatic: boolean = false) => {
  const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);
  const newEvent = new PaymentEvent();
  newEvent.payment = payment;
  newEvent.type = type;
  newEvent.description = description;
  newEvent.is_automatic = isAutomatic;
  await paymentEventRepo.save(newEvent);
};

// Helper function to create payment notifications (placeholder)
const createPaymentNotifications = async (paymentId: number, type: string) => {
  console.log(`Payment notification: ${type} for payment ${paymentId}`);
  // TODO: Implement actual notification logic
};

// Helper function to redeem MXNb for MXN (placeholder)
const redeemMXNbForMXN = async (amount: number, clabe: string) => {
  console.log(`Redeeming ${amount} MXNb for MXN to CLABE ${clabe}`);
  // TODO: Implement actual redemption logic
};

// Helper function to handle permanent CLABE deposits (placeholder)
const handlePermanentClabeDeposit = async (user: User, amount: number) => {
  console.log(`Handling permanent CLABE deposit for user ${user.id}, amount: ${amount}`);
  // TODO: Implement actual deposit handling logic
};

// GET all payments for the authenticated user
export const getPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const userId = req.user.id;

    const payments = await paymentRepo.createQueryBuilder("payment")
      .leftJoinAndSelect("payment.escrows", "escrow")
      .leftJoin("payment.payer", "payer")
      .leftJoin("payment.recipient", "recipient")
      .addSelect(["payer.id", "payer.email", "recipient.id", "recipient.email"])
      .where("payment.payerId = :userId OR payment.recipientId = :userId", { userId })
      .orderBy("payment.created_at", "DESC")
      .getMany();

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: 'Internal server error while fetching payments.' });
  }
};

// GET a single payment by ID
export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const paymentId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const payment = await paymentRepo.createQueryBuilder("payment")
      .leftJoinAndSelect("payment.escrows", "escrow")
      .leftJoinAndSelect("payment.events", "event")
      .leftJoin("payment.payer", "payer")
      .leftJoin("payment.recipient", "recipient")
      .addSelect(["payer.id", "payer.email", "recipient.id", "recipient.email"])
      .where("payment.id = :paymentId", { paymentId })
      .andWhere("(payment.payerId = :userId OR payment.recipientId = :userId)", { userId })
      .orderBy("event.created_at", "ASC")
      .getOne();

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or you do not have permission to view it.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(`Error fetching payment with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error while fetching the payment.' });
  }
};

// POST a new Web3 payment (on-chain)
export const initiateWeb3Payment = async (req: AuthenticatedRequest, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { recipientEmail, amount, custodyDays, description, warrantyPercent, approvalTxHash, escrowTxHash } = req.body;
    const payerId = req.user?.id;

    // Validate input
    if (!recipientEmail || !amount || !custodyDays || !description || warrantyPercent === undefined) {
      return res.status(400).json({ message: 'Missing required fields: recipientEmail, amount, custodyDays, description, warrantyPercent' });
    }

    // Parse and validate warrantyPercent with default
    const custodyPercent = warrantyPercent !== undefined ? parseFloat(warrantyPercent) : 0;
    if (isNaN(custodyPercent) || custodyPercent < 0 || custodyPercent > 100) {
      return res.status(400).json({ message: 'Warranty percentage must be a valid number between 0 and 100.' });
    }

    // Parse and validate custodyDays with default
    const custodyDaysNum = custodyDays !== undefined ? parseInt(custodyDays, 10) : 30;
    if (isNaN(custodyDaysNum) || custodyDaysNum < 0) {
      return res.status(400).json({ message: 'Custody days must be a valid positive number.' });
    }

    const userRepo = queryRunner.manager.getRepository(User);
    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const escrowRepo = queryRunner.manager.getRepository(Escrow);

    const payer = await userRepo.findOneBy({ id: payerId });
    const recipient = await userRepo.findOneBy({ email: recipientEmail });

    if (!payer) {
      return res.status(404).json({ message: 'Payer not found.' });
    }
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }
    if (!payer.wallet_address || !recipient.wallet_address) {
      return res.status(400).json({ message: 'Both payer and recipient must have a wallet address for Web3 payments.' });
    }
    if (!payer.portal_share) {
      return res.status(400).json({ message: 'Payer must have portal share for Web3 payments.' });
    }

    const newPayment = new Payment();
    newPayment.user = payer; // The payer/buyer
    newPayment.seller = recipient; // The recipient/seller
    newPayment.payer_email = payer.email; // Required field
    newPayment.recipient_email = recipient.email; // Required field - was missing!
    newPayment.amount = parseFloat(amount);
    newPayment.description = description;
    newPayment.status = 'pending_escrow';
    newPayment.payment_type = 'web3';
    newPayment.reference = `WEB3-${Date.now()}`;
    const savedPayment = await paymentRepo.save(newPayment);

    const custodyAmount = (parseFloat(amount) * custodyPercent) / 100;
    const releaseAmount = parseFloat(amount) - custodyAmount;
    const custodyEnd = new Date();
    custodyEnd.setDate(custodyEnd.getDate() + custodyDaysNum);

    const newEscrow = new Escrow();
    newEscrow.payment = savedPayment;
    newEscrow.custody_percent = custodyPercent;
    newEscrow.custody_amount = custodyAmount;
    newEscrow.release_amount = releaseAmount;
    newEscrow.custody_end = custodyEnd;
    newEscrow.status = 'pending_creation';
    const savedEscrow = await escrowRepo.save(newEscrow);

    // Real Portal MPC token approval step
    const MXNB_CONTRACT_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS!;
    const ESCROW_CONTRACT_ADDRESS = process.env.KUSTODIA_ESCROW_V3_ADDRESS!;
    
    if (!MXNB_CONTRACT_ADDRESS || !ESCROW_CONTRACT_ADDRESS) {
      throw new Error('Missing contract addresses in environment variables');
    }

    // Create ERC-20 approve transaction calldata
    // Store real transaction hashes from frontend Portal SDK operations
    if (approvalTxHash) {
      console.log(`[Payment] Storing approval transaction hash: ${approvalTxHash}`);
      savedPayment.blockchain_tx_hash = approvalTxHash;
      await createPaymentEvent(savedPayment, 'token_approved', `MXNB token approval completed via Portal SDK. Tx: ${approvalTxHash}`);
    }
    
    if (escrowTxHash) {
      console.log(`[Payment] Storing escrow transaction hash: ${escrowTxHash}`);
      savedEscrow.blockchain_tx_hash = escrowTxHash;
      savedEscrow.status = 'active';
      await createPaymentEvent(savedPayment, 'escrow_created', `On-chain escrow created via Portal SDK. Tx: ${escrowTxHash}`);
    } else {
      savedEscrow.status = 'pending_creation';
    }
    
    await escrowRepo.save(savedEscrow);
    
    console.log(`[Payment] Payment and escrow records updated with real transaction hashes.`);
    savedPayment.status = escrowTxHash ? 'escrow_created' : 'pending_escrow';
    await paymentRepo.save(savedPayment);

    await createPaymentEvent(savedPayment, 'payment_initiated', `Payment of ${amount} initiated by ${payer.email} to ${recipient.email}.`);
    await createPaymentEvent(savedPayment, 'escrow_created', `On-chain escrow created with ID: ${savedEscrow.id}.`);

    await queryRunner.commitTransaction();

    console.log(`[Payment] Web3 payment initiated successfully. ID: ${savedPayment.id}`);

    // Return payment with tracker URL
    res.status(201).json({ 
      message: escrowTxHash ? 'Web3 payment and escrow created successfully via Portal SDK.' : 'Web3 payment initiated. Escrow creation pending.', 
      payment: savedPayment, 
      escrow: savedEscrow,
      trackerUrl: `/dashboard/pagos/${savedPayment.id}`,
      approvalTxHash: approvalTxHash || null,
      escrowTxHash: escrowTxHash || null
    });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error initiating Web3 payment:", error);
    res.status(500).json({ message: 'Internal server error during Web3 payment initiation.' });
  } finally {
    await queryRunner.release();
  }
};

// POST to fund a Web3 escrow
export const fundWeb3Escrow = async (req: AuthenticatedRequest, res: Response) => {
  const { paymentId } = req.body;
  const funderId = req.user.id;
  // Get user with portal_share from database
  const userRepo = AppDataSource.getRepository(User);
  const userWithPortalShare = await userRepo.findOne({ where: { id: req.user.id } });
  if (!userWithPortalShare?.portal_share) {
    return res.status(400).json({ message: 'User portal share not found' });
  }
  const userPortalShare = userWithPortalShare.portal_share;

  if (!paymentId) {
    return res.status(400).json({ message: 'Payment ID is required.' });
  }
  if (!userPortalShare) {
    return res.status(400).json({ message: 'User Portal share is required for funding.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const escrowRepo = queryRunner.manager.getRepository(Escrow);
    const userRepo = queryRunner.manager.getRepository(User);

    const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ["payer", "recipient", "escrows"] });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    if (payment.user.id !== funderId) {
      return res.status(403).json({ message: 'You are not authorized to fund this payment.' });
    }
    if (payment.status !== 'escrow_created') {
      return res.status(400).json({ message: `Payment cannot be funded in its current state: ${payment.status}` });
    }

    const escrow = payment.escrow;
    if (!escrow || !escrow.smart_contract_escrow_id) {
      return res.status(400).json({ message: 'Escrow not properly created on-chain.' });
    }

    const funder = await userRepo.findOneBy({ id: funderId });
    if (!funder || !funder.wallet_address) {
        return res.status(400).json({ message: 'Funder wallet address not found.' });
    }

    const { txHash } = await fundV3Escrow({
      funderAddress: funder.wallet_address,
      escrowId: escrow.smart_contract_escrow_id,
      amount: payment.amount.toString(),
      userPortalShare: userPortalShare
    });

    escrow.status = 'funded';
    escrow.blockchain_tx_hash = txHash;
    await escrowRepo.save(escrow);

    payment.status = 'in_escrow';
    await paymentRepo.save(payment);

    await createPaymentEvent(payment, 'escrow_funded', `Escrow funded by ${funder.email}. Tx: ${txHash}.`);
    await queryRunner.commitTransaction();

    await createNotification(payment.user.id, `Your payment of ${payment.amount} has been successfully funded.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
    await createNotification(payment.seller.id, `The payment from ${payment.user.email} is now funded and in escrow.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');

    res.status(200).json({ message: 'Escrow funded successfully.', txHash });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error funding Web3 escrow:", error);
    res.status(500).json({ message: 'Internal server error during escrow funding.' });
  } finally {
    await queryRunner.release();
  }
};

// POST to release a Web3 escrow
export const releaseWeb3Payment = async (req: AuthenticatedRequest, res: Response) => {
  const { paymentId } = req.body;
  const releasingUserId = req.user.id;

  if (!paymentId) {
    return res.status(400).json({ message: 'Payment ID is required.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const escrowRepo = queryRunner.manager.getRepository(Escrow);

    const payment = await paymentRepo.findOne({ where: { id: paymentId }, relations: ["payer", "recipient", "escrows"] });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    if (payment.user.id !== releasingUserId && payment.seller.id !== releasingUserId) {
      return res.status(403).json({ message: 'You are not a party to this payment.' });
    }
    if (payment.status !== 'in_escrow') {
      return res.status(400).json({ message: `Payment cannot be released in its current state: ${payment.status}` });
    }

    const escrow = payment.escrow;
    if (!escrow || !escrow.smart_contract_escrow_id) {
      return res.status(400).json({ message: 'Escrow not properly created on-chain.' });
    }
    if (new Date() < new Date(escrow.custody_end)) {
        return res.status(400).json({ message: 'Custody period has not ended yet.' });
    }

    const { txHash } = await releaseV3Escrow(escrow.smart_contract_escrow_id);

    escrow.status = 'released';
    escrow.blockchain_tx_hash = txHash;
    await escrowRepo.save(escrow);

    payment.status = 'completed';
    await paymentRepo.save(payment);

    await createPaymentEvent(payment, 'escrow_released', `Escrow released. Tx: ${txHash}.`);
    await queryRunner.commitTransaction();

    await createNotification(payment.user.id, `The payment to ${payment.seller.email} has been released from escrow.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');
    await createNotification(payment.seller.id, `Funds from ${payment.user.email} have been released to you.`, `/payments/${payment.id}`, 'success', payment.id, 'payment');

    res.status(200).json({ message: 'Escrow released successfully.', txHash });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error releasing Web3 escrow:", error);
    if (error instanceof Error && error.message.includes("Custody period not over")) {
        return res.status(400).json({ message: "Release failed: The custody period has not yet ended." });
    }
    res.status(500).json({ message: 'Internal server error during escrow release.' });
  } finally {
    await queryRunner.release();
  }
};

// Juno webhook handler for processing bank deposits
export const junoWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clabe, amount, transaction_id } = req.body;
    const webhookClabe = clabe;
    const webhookAmount = amount;
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    const userRepo = AppDataSource.getRepository(User);
    const junoTxRepo = AppDataSource.getRepository(JunoTransaction);
    const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);

    // --- Flow 1: Check for a temporary payment CLABE ---
    const payment = await paymentRepo.findOne({
      where: { deposit_clabe: webhookClabe, status: 'pending' },
      relations: ['user', 'escrow']
    });

    if (payment) {
      console.log(`[JUNO] Processing webhook for payment ID: ${payment.id}, CLABE: ${webhookClabe}`);
      const webhookTransactionId = transaction_id;
      let junoTransaction = await junoTxRepo.findOne({ where: { reference: webhookTransactionId } });

      if (!junoTransaction) {
        console.log(`[junoWebhook] JunoTransaction not found for reference ${webhookTransactionId}. Creating a new one.`);
        junoTransaction = new JunoTransaction();
        junoTransaction.reference = webhookTransactionId;
        junoTransaction.amount = parseFloat(webhookAmount);
        junoTransaction.type = 'DEPOSIT';
        junoTransaction.status = 'COMPLETED';
        await junoTxRepo.save(junoTransaction);
      } else {
        console.log(`[junoWebhook] Found existing JunoTransaction: ${junoTransaction.id}`);
      }

      // Assign the entity to the relation
      payment.junoTransaction = junoTransaction;
      // Also populate the legacy field for compatibility
      payment.transaction_id = webhookTransactionId;
      payment.status = 'funded';
      await paymentRepo.save(payment);

      await paymentEventRepo.save(paymentEventRepo.create({
        paymentId: payment.id,
        type: 'deposit_received',
        description: `💸 Depósito recibido en CLABE. ID de Juno: ${transaction_id}`
      }));

      // Logic for handling escrow, notifications, and potential payout
      payment.status = 'funded';
      await createPaymentNotifications(payment.id, 'funds_received');

      // If the payment has a payout_clabe, it implies direct transfer, not escrow
      if (payment.payout_clabe) {
        try {
          console.log(`[JUNO] Redeeming funds for payment ${payment.id}`);
          await redeemMXNbForMXN(payment.amount, payment.payout_clabe);
          payment.status = 'completed';
          await createPaymentNotifications(payment.id, 'payment_released');
        } catch (redemptionErr) {
          console.error(`[JUNO] Redemption failed for payment ${payment.id}:`, redemptionErr);
          payment.status = 'failed';
          await createPaymentNotifications(payment.id, 'payment_failed');
        }
      }
      
      await paymentRepo.save(payment);
    }

    // --- Flow 2: Check for a permanent user deposit CLABE ---
    const user = await userRepo.findOne({ where: { deposit_clabe: webhookClabe } });
    if (user) {
      console.log(`[JUNO] Processing webhook for permanent user CLABE: ${webhookClabe} for user ID: ${user.id}`);
      // This is a deposit to a permanent user CLABE, handle Web3 logic
      await handlePermanentClabeDeposit(user, parseFloat(webhookAmount));
    } else {
      // Neither a payment nor a user CLABE was found
      console.log(`[JUNO] Webhook for CLABE ${webhookClabe} did not match any pending payment or user.`);
    }

    // Always respond with 200 OK to Juno to prevent retries
    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Juno webhook processing error:', String(err));
    res.status(500).json({ error: 'Webhook processing failed', details: String(err) });
  }
};
