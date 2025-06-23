import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import main escrow funding logic from sendEscrowFunds
import { main as fundEscrow } from "./sendEscrowFunds";

const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
const BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET!;
const MXNB_AMOUNT = 1000.0; // Amount to withdraw
const MXNB_DECIMALS = 6;
const MXNB_MIN_BALANCE = ethers.utils.parseUnits(MXNB_AMOUNT.toString(), MXNB_DECIMALS);
const MXNB_TOKEN = process.env.MOCK_ERC20_ADDRESS!;
const ETH_RPC_URL = process.env.ETH_RPC_URL!;

async function withdrawFromJuno() {
  const endpoint = '/mint_platform/v1/withdrawals';
  const url = `${BASE_URL}${endpoint}`;

  // Generate or reuse an idempotency key (for demo, use a fixed key per run)
  // Allow passing a fixed nonce for idempotency (via env or CLI)
  const CLI_NONCE = process.argv[2];
  const ENV_NONCE = process.env.JUNO_NONCE;
  const NONCE = CLI_NONCE || ENV_NONCE || Date.now().toString();
  const idempotencyKey = process.env.JUNO_IDEMPOTENCY_KEY || `kustodia-${NONCE}`;

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
  console.log('[TRACE] Using nonce (idempotency key):', nonce);
  console.log('[TRACE] Using Idempotency-Key header:', headers['Idempotency-Key']);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    console.log('[Juno] Withdrawal requested:', response.data);
    return response.data;
  } catch (err: any) {
    // Log the full error response for debugging
    if (err.response) {
      console.error('[Juno] Withdrawal error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('[Juno] Withdrawal error:', err.message || err);
    }
    throw err;
  }
}



async function waitForBridgeWalletFunding() {
  const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
  const token = new ethers.Contract(MXNB_TOKEN, [
    "function balanceOf(address) view returns (uint256)"
  ], provider);

  let balance = await token.balanceOf(BRIDGE_WALLET);
  let retries = 0;
  while (balance.lt(MXNB_MIN_BALANCE)) {
    console.log(`[MXNB] Waiting for bridge wallet funding... Current: ${ethers.utils.formatUnits(balance, MXNB_DECIMALS)} MXNB`);
    await new Promise(res => setTimeout(res, 15000)); // 15s poll
    balance = await token.balanceOf(BRIDGE_WALLET);
    retries++;
    if (retries > 40) throw new Error("Timeout waiting for MXNB funding.");
  }
  console.log(`[MXNB] Bridge wallet funded: ${ethers.utils.formatUnits(balance, MXNB_DECIMALS)} MXNB`);
}

async function main() {
  // 1. Withdraw MXNB from Juno
  await withdrawFromJuno();

  // 2. Wait for funding
  await waitForBridgeWalletFunding();

  // 3. Fund escrow (calls your existing script)
  await fundEscrow();
}

main().catch(console.error);
