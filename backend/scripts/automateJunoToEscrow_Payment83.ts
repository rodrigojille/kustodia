import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import custom escrow funding logic for Payment 83
import { main as fundEscrowPayment83 } from "./sendEscrowFunds_Payment83";

const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
const MXNB_AMOUNT = 1000.0; // Amount to withdraw for Payment 83
const MXNB_DECIMALS = 6;
const MXNB_MIN_BALANCE = ethers.utils.parseUnits(MXNB_AMOUNT.toString(), MXNB_DECIMALS);
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS!;
const ETH_RPC_URL = process.env.ETH_RPC_URL!;

async function withdrawFromJuno() {
  console.log(`\n🚀 Step 1: Withdrawing ${MXNB_AMOUNT} MXNB from Juno to Bridge Wallet`);
  console.log(`Bridge Wallet: ${BRIDGE_WALLET}`);
  console.log(`Environment: ${JUNO_ENV}`);
  
  const endpoint = '/mint_platform/v1/withdrawals';
  const url = `${BASE_URL}${endpoint}`;

  // Generate unique idempotency key for this Payment 83 withdrawal
  const CLI_NONCE = process.argv[2];
  const ENV_NONCE = process.env.JUNO_NONCE;
  const NONCE = CLI_NONCE || ENV_NONCE || Date.now().toString();
  const idempotencyKey = process.env.JUNO_IDEMPOTENCY_KEY || `kustodia-payment83-${NONCE}`;

  const bodyObj = {
    amount: MXNB_AMOUNT,
    asset: "MXNB",
    blockchain: "ARBITRUM",
    address: BRIDGE_WALLET
  };
  const body = JSON.stringify(bodyObj);
  const nonce = NONCE;
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = require('crypto').createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    'Idempotency-Key': idempotencyKey
  };
  
  console.log('[TRACE] Using nonce:', nonce);
  console.log('[TRACE] Using Idempotency-Key:', headers['Idempotency-Key']);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log('✅ Withdrawal request successful:', response.data);
    return response.data;
  } catch (err: any) {
    // Log the full error response for debugging
    if (err.response) {
      console.error('❌ Withdrawal error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('❌ Withdrawal error:', err.message || err);
    }
    throw err;
  }
}

async function waitForBridgeWalletFunding() {
  console.log(`\n⏳ Step 2: Waiting for Bridge Wallet to receive ${MXNB_AMOUNT} MXNB...`);
  
  const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
  const token = new ethers.Contract(MXNB_TOKEN, [
    "function balanceOf(address) view returns (uint256)"
  ], provider);

  let balance = await token.balanceOf(BRIDGE_WALLET);
  let retries = 0;
  const maxRetries = 40; // 10 minutes max wait time
  
  console.log(`Initial bridge wallet balance: ${ethers.utils.formatUnits(balance, MXNB_DECIMALS)} MXNB`);
  console.log(`Required minimum balance: ${MXNB_AMOUNT} MXNB`);
  
  while (balance.lt(MXNB_MIN_BALANCE)) {
    console.log(`⏳ [${retries + 1}/${maxRetries}] Current balance: ${ethers.utils.formatUnits(balance, MXNB_DECIMALS)} MXNB (waiting for ${MXNB_AMOUNT} MXNB)`);
    await new Promise(res => setTimeout(res, 15000)); // 15s poll
    balance = await token.balanceOf(BRIDGE_WALLET);
    retries++;
    if (retries > maxRetries) {
      throw new Error(`Timeout waiting for MXNB funding after ${maxRetries * 15} seconds.`);
    }
  }
  
  console.log(`✅ Bridge wallet funded: ${ethers.utils.formatUnits(balance, MXNB_DECIMALS)} MXNB`);
}

async function main() {
  console.log(`\n🎯 Starting automated flow for Payment 83`);
  console.log(`Target: Transfer 1000 MXNB from Juno → Bridge Wallet → Escrow Smart Contract`);
  
  try {
    // Step 1: Withdraw MXNB from Juno to Bridge Wallet
    await withdrawFromJuno();

    // Step 2: Wait for Bridge Wallet to receive the MXNB
    await waitForBridgeWalletFunding();

    // Step 3: Create and fund escrow on smart contract (Payment 83 / Escrow 71)
    console.log(`\n🔒 Step 3: Creating escrow on smart contract...`);
    await fundEscrowPayment83();

    console.log(`\n🎉 SUCCESS! Complete flow executed for Payment 83:`);
    console.log(`✅ MXNB withdrawn from Juno`);
    console.log(`✅ Bridge wallet funded`);
    console.log(`✅ Escrow created and funded on smart contract`);
    console.log(`✅ Payment 83 is now ACTIVE with on-chain custody`);

  } catch (error) {
    console.error(`\n❌ Error in automated flow for Payment 83:`, error);
    throw error;
  }
}

main().catch(console.error);
