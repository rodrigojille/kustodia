import { Router, RequestHandler } from 'express';
import { authenticateJWT } from '../authenticateJWT';
import { User } from '../entity/User';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import AppDataSource from '../ormconfig';
import axios from 'axios';
import { ethers } from 'ethers';

const router = Router();

interface Web3PaymentRequest {
  recipient_email: string;
  amount: number;
  description: string;
  warranty_percent: number;
  custody_days: number;
}

interface PortalTransactionRequest {
  to: string;
  data: string;
  amount?: string;
  description: string;
}

// Helper function to send Portal transaction using proper v3 API + MPC Enclave flow
async function sendPortalTransaction(user: User, txRequest: PortalTransactionRequest): Promise<string> {
  if (!user.portal_client_id) {
    throw new Error('User Portal client ID not found');
  }

  if (!user.portal_share) {
    throw new Error('User Portal signing share not found');
  }

  console.log('🔄 [Portal] Building transaction using v3 API...', {
    clientId: user.portal_client_id,
    to: txRequest.to,
    description: txRequest.description
  });

  // Debug API keys
  console.log('🔑 [Portal] API Keys Debug:', {
    clientApiKey: process.env.PORTAL_CLIENT_API_KEY?.substring(0, 8) + '...',
    custodianApiKey: process.env.PORTAL_CUSTODIAN_API_KEY?.substring(0, 8) + '...'
  });

  try {
    // Direct MPC Enclave API call - bypass v3 API issues
    console.log('🔄 [Portal] Signing transaction directly with MPC Enclave...');
    
    const signResponse = await axios.post(
      'https://mpc-client.portalhq.io/v1/sign',
      {
        share: user.portal_share,
        method: 'eth_sendTransaction',
        params: JSON.stringify({
          to: txRequest.to,
          data: txRequest.data || '0x',
          value: txRequest.amount || '0x0',
          gas: '0x7A120', // 500000 in hex
          gasPrice: '0x9502F9000' // 40 gwei in hex
        }),
        chainId: 'eip155:421614',
        rpcUrl: 'https://api.portalhq.io/rpc/v1/eip155/421614'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PORTAL_CUSTODIAN_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('✅ [Portal] Transaction signed and sent:', {
      txHash: signResponse.data.result,
      description: txRequest.description
    });

    return signResponse.data.result;

  } catch (error: any) {
    console.error('❌ [Portal] Transaction failed:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
      clientId: user.portal_client_id
    });
    
    // Provide more specific error messages
    if (error.response?.status === 500 && error.response?.data?.id === 'AUTH_FAILED') {
      throw new Error('Portal authentication failed. Please check API key permissions and user signing share validity.');
    }
    
    throw error;
  }
}

// Create Web3 Payment with Escrow
router.post('/create', authenticateJWT, async (req, res): Promise<void> => {
  try {
    const { recipient_email, amount, description, warranty_percent, custody_days } = req.body as Web3PaymentRequest;
    const userId = (req as any).userId;

    console.log('🚀 [Web3 Payment] Starting payment creation:', {
      recipient_email,
      amount,
      description,
      warranty_percent,
      custody_days,
      userId
    });

    // Validate required fields
    if (!recipient_email || !amount || !description) {
      res.status(400).json({ error: 'Missing required fields: recipient_email, amount, description' });
      return;
    }

    // Get payer user from database
    const userRepository = AppDataSource.getRepository(User);
    const payer = await userRepository.findOne({ where: { id: userId } });

    if (!payer) {
      res.status(404).json({ error: 'Payer user not found' });
      return;
    }

    if (!payer.wallet_address || !payer.portal_share) {
      res.status(400).json({ error: 'Payer missing wallet address or Portal signing share' });
      return;
    }

    // Get seller user by email
    const seller = await userRepository.findOne({ where: { email: recipient_email } });
    if (!seller) {
      res.status(404).json({ error: `Seller not found with email: ${recipient_email}` });
      return;
    }

    if (!seller.wallet_address) {
      res.status(400).json({ error: 'Seller has no wallet address' });
      return;
    }

    console.log('✅ [Web3 Payment] Users validated:', {
      payer: { email: payer.email, wallet: payer.wallet_address },
      seller: { email: seller.email, wallet: seller.wallet_address }
    });

    // Create payment record
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = paymentRepository.create({
      user: payer,
      seller: seller,
      recipient_email: recipient_email,
      amount: amount,
      currency: 'MXNB',
      description: description,
      status: 'processing',
      payment_type: 'web3',
      commission_percent: warranty_percent || 5
    });

    await paymentRepository.save(payment);
    console.log('✅ [Web3 Payment] Payment record created:', payment.id);

    // Create payment event
    const paymentEventRepository = AppDataSource.getRepository(PaymentEvent);
    await paymentEventRepository.save(paymentEventRepository.create({
      paymentId: payment.id,
      type: 'payment_initiated',
      description: 'Web3 payment initiated - processing approval and escrow creation'
    }));

    // Step 1: Token Approval Transaction
    console.log('🔄 [Web3 Payment] Step 1: Token approval...');
    
    const approvalAmount = ethers.parseUnits(amount.toString(), 18);
    const approveCalldata = new ethers.Interface([
      'function approve(address spender, uint256 amount) returns (bool)'
    ]).encodeFunctionData('approve', [process.env.ESCROW3_CONTRACT_ADDRESS, approvalAmount]);

    const approvalTxHash = await sendPortalTransaction(payer, {
      to: process.env.MXNB_CONTRACT_ADDRESS!,
      data: approveCalldata,
      description: `Token approval for payment ${payment.id}: ${description}`
    });

    console.log('✅ [Web3 Payment] Token approval successful:', approvalTxHash);

    // Update payment with approval transaction hash
    payment.blockchain_tx_hash = approvalTxHash;
    await paymentRepository.save(payment);

    // Add approval event
    await paymentEventRepository.save(paymentEventRepository.create({
      paymentId: payment.id,
      type: 'tokens_approved',
      description: `Tokens approved for escrow. Tx: ${approvalTxHash}`
    }));

    // Step 2: Escrow Creation Transaction
    console.log('🔄 [Web3 Payment] Step 2: Escrow creation...');
    
    const custodyAmount = (amount * (warranty_percent || 5)) / 100;
    const releaseAmount = amount - custodyAmount;
    const custodyDaysInt = custody_days || 1;

    const escrowCalldata = new ethers.Interface([
      'function createEscrow(address payer, address seller, uint256 amount, uint256 custodyAmount, uint256 custodyPeriod, uint256 releaseAmount, address token, string memory description) returns (uint256)'
    ]).encodeFunctionData('createEscrow', [
      payer.wallet_address,
      seller.wallet_address,
      ethers.parseUnits(amount.toString(), 18),
      ethers.parseUnits(custodyAmount.toString(), 18),
      custodyDaysInt,
      ethers.parseUnits(releaseAmount.toString(), 18),
      process.env.MXNB_CONTRACT_ADDRESS!,
      description
    ]);

    const escrowTxHash = await sendPortalTransaction(payer, {
      to: process.env.ESCROW3_CONTRACT_ADDRESS!,
      data: escrowCalldata,
      description: `Escrow creation for payment ${payment.id}: ${description}`
    });

    console.log('✅ [Web3 Payment] Escrow creation successful:', escrowTxHash);

    // Create escrow record
    const escrowRepository = AppDataSource.getRepository(Escrow);
    const escrow = escrowRepository.create({
      payment: payment,
      smart_contract_escrow_id: '', // Will be updated by webhook when we get the escrow ID from blockchain
      custody_percent: warranty_percent || 5,
      custody_amount: Math.trunc(custodyAmount),
      release_amount: Math.trunc(releaseAmount),
      status: 'pending',
      dispute_status: 'none',
      custody_end: new Date(Date.now() + custodyDaysInt * 24 * 60 * 60 * 1000),
      blockchain_tx_hash: escrowTxHash
    });

    await escrowRepository.save(escrow);
    console.log('✅ [Web3 Payment] Escrow record created:', escrow.id);

    // Update payment status
    payment.status = 'funded';
    await paymentRepository.save(payment);

    // Add escrow creation event
    await paymentEventRepository.save(paymentEventRepository.create({
      paymentId: payment.id,
      type: 'escrow_created',
      description: `Escrow created successfully. Tx: ${escrowTxHash}`
    }));

    console.log('🎉 [Web3 Payment] Payment completed successfully!', {
      paymentId: payment.id,
      approvalTx: approvalTxHash,
      escrowTx: escrowTxHash
    });

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        recipient_email: payment.recipient_email,
        approval_tx_hash: approvalTxHash,
        escrow_tx_hash: escrowTxHash,
        escrow_id: escrow.id
      }
    });

  } catch (error: any) {
    console.error('❌ [Web3 Payment] Payment failed:', error);
    
    // Log the actual error response from Portal API
    if (error?.response) {
      console.error('Portal API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Try to get the actual error response body
      try {
        const errorBody = error.response.data;
        console.error('Portal API Error Body:', errorBody);
      } catch (e) {
        console.error('Could not read error response body');
      }
    }

    res.status(500).json({
      error: 'Web3 payment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
