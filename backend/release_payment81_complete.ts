import "reflect-metadata";
import { AppDataSource } from "../src/data-source";
import { Escrow } from "../src/entity/Escrow";
import { Payment } from "../src/entity/Payment";
import { PaymentEvent } from "../src/entity/PaymentEvent";
import { ethers } from "ethers";
import axios from "axios";
import crypto from "crypto";

// Environment variables
const RPC_URL = process.env.ETH_RPC_URL!;
const PRIVATE_KEY = process.env.ESCROW_PRIVATE_KEY!;
const ESCROW_CONTRACT = process.env.ESCROW_CONTRACT_ADDRESS_2!;
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
const JUNO_SELLER_BANK_ACCOUNT_ID = process.env.JUNO_SELLER_BANK_ACCOUNT_ID!;

const PAYMENT_ID = 81;
const SMART_CONTRACT_ESCROW_ID = 1; // From database analysis

const ESCROW_ABI = [
  "function release(uint256 escrowId) public",
  "function escrows(uint256) view returns (address payer, address payee, uint256 amount, uint256 deadline, string vertical, string clabe, uint8 status, string conditions, address token)"
];

/**
 * Complete release and redemption flow for Payment 81
 */
async function releasePayment81Complete() {
  console.log('🚀 COMPLETE RELEASE & REDEMPTION FLOW - PAYMENT 81');
  console.log('==================================================');
  console.log(`Payment ID: ${PAYMENT_ID}`);
  console.log(`Smart Contract Escrow ID: ${SMART_CONTRACT_ESCROW_ID}`);
  console.log(`Juno Environment: ${JUNO_ENV}`);
  console.log('');

  await AppDataSource.initialize();
  
  const escrowRepo = AppDataSource.getRepository(Escrow);
  const paymentRepo = AppDataSource.getRepository(Payment);
  const eventRepo = AppDataSource.getRepository(PaymentEvent);

  try {
    // Step 1: Get Payment and Escrow from database
    console.log('📋 Step 1: Getting Payment and Escrow data...');
    const payment = await paymentRepo.findOne({ 
      where: { id: PAYMENT_ID },
      relations: ['escrow']
    });

    if (!payment || !payment.escrow) {
      throw new Error(`Payment ${PAYMENT_ID} or its escrow not found`);
    }

    const escrow = payment.escrow;
    console.log(`✅ Found Payment ${payment.id}: ${payment.amount} MXN to ${payment.recipient_email}`);
    console.log(`✅ Found Escrow ${escrow.id}: ${escrow.custody_amount} MXNB, Status: ${escrow.status}`);
    console.log('');

    // Step 2: Check if custody period has ended
    console.log('📅 Step 2: Checking custody period...');
    const now = new Date();
    const custodyEnd = new Date(escrow.custody_end);
    const canRelease = now >= custodyEnd;
    
    console.log(`Current Time: ${now.toISOString()}`);
    console.log(`Custody End: ${custodyEnd.toISOString()}`);
    console.log(`Can Release: ${canRelease ? '✅ YES' : '❌ NO'}`);
    
    if (!canRelease) {
      const timeLeft = custodyEnd.getTime() - now.getTime();
      const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
      throw new Error(`Custody period not yet ended. ${hoursLeft} hours remaining.`);
    }
    console.log('');

    // Step 3: Release escrow on blockchain
    console.log('🔓 Step 3: Releasing escrow on blockchain...');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(ESCROW_CONTRACT, ESCROW_ABI, signer);

    // Check current escrow status
    const escrowDetails = await contract.escrows(SMART_CONTRACT_ESCROW_ID);
    console.log(`Current escrow status: ${escrowDetails[6]} (0=Created, 1=Funded, 2=Released, 3=Disputed)`);
    
    if (escrowDetails[6] === 2) {
      console.log('✅ Escrow already released on blockchain');
    } else if (escrowDetails[6] === 1) {
      console.log('💰 Calling release function...');
      const releaseTx = await contract.release(SMART_CONTRACT_ESCROW_ID, {
        gasLimit: 300_000,
        gasPrice: ethers.utils.parseUnits('0.1', 'gwei')
      });
      console.log(`⏳ Release transaction: ${releaseTx.hash}`);
      const releaseReceipt = await releaseTx.wait();
      console.log(`✅ Release confirmed in block ${releaseReceipt.blockNumber}`);
      
      // Update database
      escrow.release_tx_hash = releaseTx.hash;
      escrow.status = 'released';
      await escrowRepo.save(escrow);
      
      // Log event
      const releaseEvent = eventRepo.create({
        payment_id: payment.id,
        type: "escrow_released",
        data: { 
          txHash: releaseTx.hash, 
          releasedAt: Date.now(),
          smartContractEscrowId: SMART_CONTRACT_ESCROW_ID
        }
      });
      await eventRepo.save(releaseEvent);
      console.log('✅ Database updated with release transaction');
    } else {
      throw new Error(`Escrow not in FUNDED status. Current status: ${escrowDetails[6]}`);
    }
    console.log('');

    // Step 4: Redeem MXNB via Juno
    console.log('💱 Step 4: Redeeming MXNB via Juno...');
    const redemptionAmount = Math.floor(parseFloat(escrow.custody_amount));
    console.log(`Redemption amount: ${redemptionAmount} MXNB`);

    const apiPath = "/mint_platform/v1/redemptions";
    const url = `${JUNO_BASE_URL}${apiPath}`;
    const method = "POST";
    const bodyObj = {
      amount: redemptionAmount,
      destination_bank_account_id: JUNO_SELLER_BANK_ACCOUNT_ID,
      asset: "mxn",
    };
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const stringToSign = `${nonce}${method}${apiPath}${body}`;
    const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(stringToSign).digest("hex");
    
    const headers = {
      Authorization: `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
      "Content-Type": "application/json",
    };

    console.log('📤 Calling Juno redemption API...');
    console.log(`URL: ${url}`);
    console.log(`Body: ${body}`);

    const response = await axios.post(url, bodyObj, { headers });
    console.log('✅ Juno redemption response:', response.data);
    
    // Log redemption event
    const redemptionEvent = eventRepo.create({
      payment_id: payment.id,
      type: "mxnb_redeemed",
      data: {
        amount: redemptionAmount,
        junoResponse: response.data,
        redeemedAt: Date.now()
      }
    });
    await eventRepo.save(redemptionEvent);
    console.log('✅ Redemption logged in database');
    console.log('');

    // Step 5: Update payment status
    console.log('📝 Step 5: Updating payment status...');
    payment.status = 'completed';
    await paymentRepo.save(payment);
    
    const completionEvent = eventRepo.create({
      payment_id: payment.id,
      type: "payment_completed",
      data: {
        completedAt: Date.now(),
        finalAmount: redemptionAmount,
        recipientEmail: payment.recipient_email,
        payoutClabe: payment.payout_clabe
      }
    });
    await eventRepo.save(completionEvent);
    console.log('✅ Payment status updated to completed');
    console.log('');

    // Final Summary
    console.log('🎉 PAYMENT 81 RELEASE FLOW COMPLETED SUCCESSFULLY!');
    console.log('================================================');
    console.log(`✅ Escrow released: ${escrow.custody_amount} MXNB`);
    console.log(`✅ MXNB redeemed: ${redemptionAmount} MXN`);
    console.log(`✅ Payment completed for: ${payment.recipient_email}`);
    console.log(`✅ Payout CLABE: ${payment.payout_clabe}`);
    console.log(`✅ Total events logged: 3`);

  } catch (error) {
    console.error('❌ Error in release flow:', error.message);
    
    // Log error event
    try {
      const errorEvent = eventRepo.create({
        payment_id: PAYMENT_ID,
        type: "release_error",
        data: {
          error: error.message,
          timestamp: Date.now()
        }
      });
      await eventRepo.save(errorEvent);
    } catch (e) {
      console.error('Failed to log error event:', e);
    }
    
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  releasePayment81Complete().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { releasePayment81Complete };
