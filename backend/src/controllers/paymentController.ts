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
import { createJunoClabe } from '../services/junoService';
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

// Helper function to create payment notifications
const createPaymentNotifications = async (paymentId: number, type: string) => {
  try {
    const { createPaymentNotifications: createNotifications } = await import('../services/paymentNotificationIntegration');
    
    // Map the type string to PaymentEventType
    let eventType: string;
    switch (type) {
      case 'funds_received':
        eventType = 'payment_funded';
        break;
      case 'payment_released':
        eventType = 'payment_completed';
        break;
      case 'payment_failed':
        eventType = 'payment_failed';
        break;
      default:
        eventType = 'payment_updated';
    }
    
    await createNotifications(paymentId, eventType as any);
    console.log(`Payment notification created: ${type} for payment ${paymentId}`);
  } catch (error) {
    console.error(`Error creating payment notification for payment ${paymentId}:`, error);
  }
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

/**
 * Initiate Direct Payment (CLABE/SPEI)
 * Creates Payment and Escrow records, generates unique CLABE via Juno API
 */
export const initiatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      recipient_email,
      amount,
      currency = 'mxn',
      description,
      custody_percent = 100, // Default 100% in custody
      custody_period = 432000, // Default 5 days in seconds (5 * 24 * 60 * 60)
      commission_amount = 0,
      commission_beneficiary_email,
      travel_rule_data,
      // Nuevo flujo parameters
      payment_type = 'traditional', // 'traditional' | 'nuevo_flujo' | 'web3'
      vertical_type, // e.g., 'freelance', 'inmobiliaria', 'marketplace'
      release_conditions, // Custom release conditions for nuevo_flujo
      // Product-specific fields
      transaction_subtype,
      // Vehicle fields
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      vehicle_vin,
      vehicle_mileage,
      vehicle_condition,
      // Electronics fields
      electronics_brand,
      electronics_model,
      electronics_condition,
      electronics_warranty,
      electronics_serial,
      // Appliance fields
      appliance_type,
      appliance_brand,
      appliance_years_use,
      appliance_efficiency,
      appliance_condition,
      appliance_serial,
      // Furniture fields
      furniture_type,
      furniture_material,
      furniture_dimensions,
      furniture_condition
    } = req.body;

    // Validate required fields
    if (!recipient_email || !amount || amount <= 0) {
      res.status(400).json({ error: 'Recipient email and positive amount are required' });
      return;
    }

    if (custody_percent < 0 || custody_percent > 100) {
      res.status(400).json({ error: 'Custody percent must be between 0 and 100' });
      return;
    }

    // Validate travel_rule_data structure if present
    if (travel_rule_data && typeof travel_rule_data !== 'object') {
      res.status(400).json({ error: 'travel_rule_data must be an object if provided' });
      return;
    }

    // Validate nuevo_flujo specific requirements
    if (payment_type === 'nuevo_flujo' && !vertical_type) {
      res.status(400).json({ error: 'vertical_type is required for nuevo_flujo payments' });
      return;
    }

    const tokenUser = req.user;
    if (!tokenUser || !tokenUser.email) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    // Initialize repositories
    const userRepo = AppDataSource.getRepository(User);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);

    // 1. Validate payer user exists
    const payerUser = await userRepo.findOne({ where: { email: tokenUser.email } });
    if (!payerUser) {
      res.status(404).json({ error: 'Usuario pagador no encontrado' });
      return;
    }

    // 2. Validate recipient user exists and is verified
    const recipientUser = await userRepo.findOne({ where: { email: recipient_email } });
    if (!recipientUser) {
      res.status(404).json({ error: 'Usuario destinatario no encontrado' });
      return;
    }

    if (recipientUser.kyc_status !== 'approved') {
      res.status(400).json({ error: 'El destinatario debe estar verificado para recibir pagos' });
      return;
    }

    // 3. Validate commission beneficiary if provided
    let commissionBeneficiaryUser = null;
    if (commission_amount > 0 && commission_beneficiary_email) {
      commissionBeneficiaryUser = await userRepo.findOne({ where: { email: commission_beneficiary_email } });
      if (!commissionBeneficiaryUser) {
        res.status(404).json({ error: 'Beneficiario de comisión no encontrado' });
        return;
      }
      if (commissionBeneficiaryUser.kyc_status !== 'approved') {
        res.status(400).json({ error: 'El beneficiario de comisión debe estar verificado' });
        return;
      }
    }

    // 4. Generate unique CLABE via Juno API for deposit
    let depositClabe: string;
    try {
      depositClabe = await createJunoClabe();
      console.log(`Generated CLABE: ${depositClabe} for user ${payerUser.email}`);
    } catch (error) {
      console.error('Error generating CLABE:', error);
      res.status(500).json({ error: 'Error al generar CLABE para depósito' });
      return;
    }

    // 5. Create Payment record
    const payment = new Payment();
    payment.user = payerUser;
    payment.seller = recipientUser;
    payment.recipient_email = recipient_email; // Fix: Add missing recipient_email
    payment.amount = parseFloat(amount.toString());
    payment.currency = currency;
    payment.description = description || 'Pago directo';
    payment.status = 'pending';
    payment.deposit_clabe = depositClabe;
    payment.payout_clabe = recipientUser.payout_clabe;
    payment.payout_juno_bank_account_id = recipientUser.juno_bank_account_id;
    payment.commission_amount = commission_amount ? parseFloat(commission_amount.toString()) : 0;
    payment.commission_beneficiary_email = commission_beneficiary_email || undefined;
    payment.commission_beneficiary_juno_bank_account_id = commissionBeneficiaryUser?.juno_bank_account_id || undefined;
    payment.travel_rule_data = travel_rule_data || null;
    payment.payer_email = payerUser.email;
    payment.payer_clabe = payerUser.deposit_clabe;
    payment.reference = undefined; // Will be set by automation when deposit is detected
    
    // Set nuevo_flujo specific fields
    payment.payment_type = payment_type;
    payment.vertical_type = vertical_type || undefined;
    payment.release_conditions = release_conditions || undefined;
    
    // Set product-specific fields
    payment.transaction_subtype = transaction_subtype || undefined;
    
    // Vehicle fields
    payment.vehicle_brand = vehicle_brand || undefined;
    payment.vehicle_model = vehicle_model || undefined;
    payment.vehicle_year = vehicle_year ? parseInt(vehicle_year.toString()) : undefined;
    payment.vehicle_vin = vehicle_vin || undefined;
    payment.vehicle_mileage = vehicle_mileage ? parseInt(vehicle_mileage.toString()) : undefined;
    payment.vehicle_condition = vehicle_condition || undefined;
    
    // Electronics fields
    payment.electronics_brand = electronics_brand || undefined;
    payment.electronics_model = electronics_model || undefined;
    payment.electronics_condition = electronics_condition || undefined;
    payment.electronics_warranty = electronics_warranty || undefined;
    payment.electronics_serial = electronics_serial || undefined;
    
    // Appliance fields
    payment.appliance_type = appliance_type || undefined;
    payment.appliance_brand = appliance_brand || undefined;
    payment.appliance_years_use = appliance_years_use ? parseInt(appliance_years_use.toString()) : undefined;
    payment.appliance_efficiency = appliance_efficiency || undefined;
    payment.appliance_condition = appliance_condition || undefined;
    payment.appliance_serial = appliance_serial || undefined;
    
    // Furniture fields
    payment.furniture_type = furniture_type || undefined;
    payment.furniture_material = furniture_material || undefined;
    payment.furniture_dimensions = furniture_dimensions || undefined;
    payment.furniture_condition = furniture_condition || undefined;
    
    // Initialize approval fields for nuevo_flujo
    if (payment_type === 'nuevo_flujo') {
      payment.payer_approval = false;
      payment.payee_approval = false;
      payment.payer_approval_timestamp = undefined;
      payment.payee_approval_timestamp = undefined;
    }

    const savedPayment = await paymentRepo.save(payment);

    // 6. Calculate custody split (matches original implementation)
    const custodyPercent = Number(custody_percent || 100); // Default to 100%
    const custodyPeriod = Number(custody_period || 432000); // Default to 5 days in seconds
    const paymentAmount = Number(savedPayment.amount);
    const custodyAmount = paymentAmount * (custodyPercent / 100);
    const releaseAmount = paymentAmount - custodyAmount;

    console.log(`[Payment ${savedPayment.id}] Custody calculation:`, {
      paymentAmount,
      custodyPercent,
      custodyPeriod,
      custodyAmount,
      releaseAmount
    });

    // 7. Create Escrow record (matches original implementation)
    const escrow = new Escrow();
    escrow.payment = savedPayment;
    escrow.smart_contract_escrow_id = ""; // Will be set after webhook
    escrow.custody_percent = custodyPercent;
    escrow.custody_amount = Math.trunc(custodyAmount);
    escrow.release_amount = Math.trunc(releaseAmount);
    escrow.status = 'pending';
    escrow.dispute_status = 'none';
    
    // Save escrow first to get created_at timestamp
    const savedEscrow = await escrowRepo.save(escrow);
    
    // Now set custody_end based on the actual created_at time
    savedEscrow.custody_end = new Date(savedEscrow.created_at.getTime() + custodyPeriod * 1000);
    await escrowRepo.save(savedEscrow);
    
    // Calculate custody days for frontend display
    const custodyDays = Math.round(custodyPeriod / (24 * 60 * 60));
    console.log(`[Payment ${savedPayment.id}] Custody days calculated: ${custodyDays} from period: ${custodyPeriod} seconds`);
    
    console.log(`[Payment ${savedPayment.id}] Escrow saved:`, {
      id: savedEscrow.id,
      custody_amount: savedEscrow.custody_amount,
      release_amount: savedEscrow.release_amount,
      custody_percent: savedEscrow.custody_percent,
      custody_end: savedEscrow.custody_end,
      status: savedEscrow.status
    });

    // Link the escrow to the payment and save
    savedPayment.escrow = savedEscrow;
    await paymentRepo.save(savedPayment);
    console.log(`[Payment ${savedPayment.id}] Payment updated with escrow_id: ${savedEscrow.id}`);

    // 8. Log payment event (NO blockchain event yet - only after deposit is received)
    await createPaymentEvent(savedPayment, 'payment_created', `Pago directo iniciado por ${payerUser.email} a ${recipientUser.email}`);
    // Only log escrow creation, NOT blockchain custody (that happens after deposit)

    // 9. Create notifications
    await createPaymentNotifications(savedPayment.id, 'payment_created');

    // 10. Send notification to recipient
    await createNotification(
      recipientUser.id,
      'Nuevo pago recibido',
      `Has recibido un pago de ${savedPayment.amount} MXN de ${payerUser.full_name || payerUser.email}`,
      'success',
      savedPayment.id,
      'payment'
    );

    // 11. Return success response with payment details (avoid circular references)
    const paymentResponse = {
      id: savedPayment.id,
      recipient_email: savedPayment.recipient_email,
      payer_email: savedPayment.payer_email,
      amount: savedPayment.amount,
      currency: savedPayment.currency,
      description: savedPayment.description,
      reference: savedPayment.reference,
      deposit_clabe: savedPayment.deposit_clabe,
      payout_clabe: savedPayment.payout_clabe,
      status: savedPayment.status,
      payment_type: savedPayment.payment_type,
      vertical_type: savedPayment.vertical_type,
      release_conditions: savedPayment.release_conditions,
      payer_approval: savedPayment.payer_approval,
      payee_approval: savedPayment.payee_approval,
      created_at: savedPayment.created_at,
      escrow_id: savedEscrow.id // Include escrow_id to confirm linkage
    };

    const escrowResponse = {
      id: savedEscrow.id,
      custody_percent: savedEscrow.custody_percent,
      custody_amount: savedEscrow.custody_amount,
      release_amount: savedEscrow.release_amount,
      status: savedEscrow.status,
      dispute_status: savedEscrow.dispute_status,
      custody_end: savedEscrow.custody_end,
      created_at: savedEscrow.created_at,
      payment_id: savedPayment.id // Include payment_id to confirm linkage
    };

    res.json({
      success: true,
      payment: paymentResponse,
      escrow: escrowResponse
    });

  } catch (error) {
    console.error('Error in initiatePayment:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al iniciar pago', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
