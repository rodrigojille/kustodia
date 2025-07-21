import 'dotenv/config';
import { ethers } from 'ethers';
import { createHmac } from 'crypto';
import axios from 'axios';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { User } from '../entity/User';

const MXNB_TOKEN = "0x82B9e52b26A2954E113F94Ff26647754d5a4247D";
const JUNO_WALLET = process.env.JUNO_WALLET!;
const BRIDGE_WALLET_PK = process.env.DEPLOYER_PRIVATE_KEY!;
const PROVIDER_URL = process.env.ETH_RPC_URL!;

// Juno configuration
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

async function transferBridgeToJuno(amount: number): Promise<string> {
  console.log(`\n💸 Transferring ${amount} MXNB from Bridge to Juno...`);
  
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(BRIDGE_WALLET_PK, provider);
  const tokenContract = new ethers.Contract(
    MXNB_TOKEN, 
    ['function transfer(address to, uint256 amount)', 'function balanceOf(address) view returns (uint256)'], 
    wallet
  );

  // Check bridge wallet balance
  const balance = await tokenContract.balanceOf(wallet.address);
  const balanceInMXNB = ethers.formatUnits(balance, 6);
  console.log(`   Bridge wallet MXNB balance: ${balanceInMXNB}`);

  if (Number(balanceInMXNB) < amount) {
    throw new Error(`Insufficient MXNB balance. Have ${balanceInMXNB}, need ${amount}`);
  }

  const decimals = 6; // MXNB uses 6 decimals
  const amountInWei = ethers.parseUnits(amount.toString(), decimals);

  console.log(`   Sending transaction...`);
  const tx = await tokenContract.transfer(JUNO_WALLET, amountInWei);
  console.log(`   Transaction sent: ${tx.hash}`);
  
  await tx.wait();
  console.log(`   ✅ Transfer confirmed!`);
  
  return tx.hash;
}

async function redeemMXNBToMXN(amount: number, beneficiary: string, clabe: string, reference: string) {
  console.log(`\n💱 Redeeming ${amount} MXNB to MXN via Juno...`);
  
  const endpoint = '/mint_platform/v1/spei_payouts';
  const url = `${BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: amount.toString(),
    beneficiary: beneficiary,
    clabe: clabe,
    notes_ref: reference,
    numeric_ref: "112",
    rfc: "XAXX010101000",
    origin_id: `kustodia_payout_112_${Date.now()}`
  };

  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

  const headers = {
    'X-Api-Key': JUNO_API_KEY,
    'X-Nonce': nonce,
    'X-Signature': signature,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log(`   ✅ Payout initiated:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`   ❌ Payout failed:`, error.response?.data || error.message);
    throw error;
  }
}

async function completePayment112() {
  await AppDataSource.initialize();
  
  try {
    console.log('🔧 Completing Payment #112 Flow...\n');
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const userRepo = AppDataSource.getRepository(User);
    
    // Get payment details
    const payment = await paymentRepo.findOne({
      where: { id: 112 },
      relations: ['escrow', 'seller']
    });
    
    if (!payment) {
      throw new Error('Payment 112 not found');
    }
    
    if (!payment.escrow) {
      throw new Error('Payment 112 has no escrow');
    }
    
    console.log('📋 Payment Details:');
    console.log(`   Amount: ${payment.amount} MXN`);
    console.log(`   Commission: ${payment.commission_amount || 0} MXN`);
    console.log(`   Net to Seller: ${Number(payment.amount) - Number(payment.commission_amount || 0)} MXN`);
    console.log(`   Seller: ${payment.seller.full_name} (${payment.seller.email})`);
    console.log(`   Seller CLABE: ${payment.seller.payout_clabe}`);
    console.log(`   Escrow Status: ${payment.escrow!.status}`);
    
    // Step 1: Transfer MXNB from Bridge to Juno
    const totalAmount = Number(payment.escrow!.release_amount || payment.amount);
    const transferTxHash = await transferBridgeToJuno(totalAmount);
    
    // Log the transfer
    const transferEvent = eventRepo.create({
      payment,
      type: 'bridge_to_juno_transfer',
      description: `Transferred ${totalAmount} MXNB to Juno. Tx: ${transferTxHash}`,
      created_at: new Date()
    });
    await eventRepo.save(transferEvent);
    
    // Step 2: Redeem MXNB to MXN and send SPEI to seller
    const netSellerAmount = totalAmount - Number(payment.commission_amount || 0);
    const payoutResult = await redeemMXNBToMXN(
      netSellerAmount,
      payment.seller.full_name || payment.seller.email,
      payment.seller.payout_clabe!,
      payment.description || "Pago Kustodia"
    );
    
    // Log the payout
    const payoutEvent = eventRepo.create({
      payment,
      type: 'seller_payout_initiated',
      description: `SPEI payout initiated for ${netSellerAmount} MXN to seller`,
      created_at: new Date()
    });
    await eventRepo.save(payoutEvent);
    
    // Step 3: Update payment and escrow status
    payment.status = 'completed';
    await paymentRepo.save(payment);
    
    payment.escrow!.status = 'released';
    await escrowRepo.save(payment.escrow!);
    
    console.log('\n✅ Payment #112 completed successfully!');
    console.log('   - MXNB transferred to Juno');
    console.log('   - SPEI payout initiated to seller');
    console.log('   - Database status updated');
    
    // Step 4: Handle commission if any
    if (payment.commission_amount && Number(payment.commission_amount) > 0 && payment.commission_beneficiary_email) {
      console.log('\n💰 Processing commission payment...');
      
      const commissionUser = await userRepo.findOne({
        where: { email: payment.commission_beneficiary_email }
      });
      
      if (commissionUser && commissionUser.payout_clabe) {
        const commissionResult = await redeemMXNBToMXN(
          Number(payment.commission_amount),
          commissionUser.full_name || payment.commission_beneficiary_email,
          commissionUser.payout_clabe,
          "Comisión Kustodia"
        );
        
        const commissionEvent = eventRepo.create({
          payment,
          type: 'commission_payout_initiated',
          description: `Commission payout initiated for ${payment.commission_amount} MXN`,
          created_at: new Date()
        });
        await eventRepo.save(commissionEvent);
        
        console.log('   ✅ Commission payout initiated');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    
    // Log the error
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const errorEvent = eventRepo.create({
      paymentId: 112,
      type: 'manual_completion_error',
      description: error.message,
      is_automatic: false
    });
    await eventRepo.save(errorEvent);
    
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the completion
completePayment112();
