import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Select API keys based on environment
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY! : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET! : process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';

console.log(`[JUNO] Using environment: ${JUNO_ENV}`);
console.log(`[JUNO] Using API key: ${JUNO_API_KEY?.slice(0, 4)}... (stage: ${JUNO_ENV === 'stage'})`);

/**
 * Creates a unique CLABE for a user via the Juno API.
 * @param userId - The user ID or unique identifier
 * @param userName - The user's full name or email
 * @returns The created CLABE string
 */
export async function createJunoClabe(): Promise<string> {
  // Correct endpoint for CLABE creation (for deposits)
  const url = 'https://stage.buildwithjuno.com/mint_platform/v1/clabes';
  const requestPath = '/mint_platform/v1/clabes';
  const method = 'POST';
  const nonce = Date.now().toString();
  const body = '{}'; // No payload for AUTO_PAYMENT CLABE

  // Build signature as per Bitso/Juno docs
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');

  // Bitso HMAC header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  // Debug logging for troubleshooting
  console.log('--- JUNO CLABE DEBUG ---');
  console.log('String to sign:', JSON.stringify(dataToSign));
  console.log('Signature:', signature);
  console.log('Headers:', headers);
  console.log('Request body:', body);
  console.log('-----------------------');


  try {
    const response = await axios.post(url, {}, { headers });
    if (response.data && response.data.success && response.data.payload && response.data.payload.clabe) {
      return response.data.payload.clabe;
    } else {
      throw new Error('Unexpected response from Juno CLABE creation: ' + JSON.stringify(response.data));
    }
  } catch (err: any) {
    console.error('Juno CLABE creation error:', err?.response?.data || err?.message || err);
    throw err;
  }
}


/**
 * Redeems MXNb for MXN via the Bitso/Juno API.
 * @param amountMXNb - Amount of MXNb to redeem (as a string or number, in MXNb units)
 * @param travelRuleData - Optional Travel Rule compliance data to include
 * @returns The redemption response from the API
 */
export async function redeemMXNbForMXN(amountMXNb: string | number, travelRuleData?: any) {
  const endpoint = '/redemptions/';
  const url = `${JUNO_BASE_URL}${endpoint}`;
  const bodyObj: any = {
    currency: "mxnb",
    amount: String(amountMXNb),
    notes_ref: "Kustodia redemption",
    origin_id: "kustodia_backend",
  };
  if (travelRuleData) {
    bodyObj.travel_rule = travelRuleData;
  }
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = "POST";
  const requestPath = "/api/v3/redemptions/";
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(dataToSign).digest("hex");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  try {
    const response = await axios.post(url, bodyObj, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Juno redemption error:', err?.response?.data || err?.message || err);
    throw err;
  }
}

export async function getJunoTxHashFromTimeline(transactionId: string, isStage = true): Promise<string | null> {
  const baseUrl = isStage
    ? 'https://stage.buildwithjuno.com'
    : 'https://buildwithjuno.com';
  const requestPath = `/mint_platform/v1/transactions/${transactionId}`;
  const url = `${baseUrl}${requestPath}`;
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };
  try {
    const response = await axios.get(url, { headers });
    const timeline = response.data?.payload?.timeline || [];
    const tokensTransferred = timeline.find((step: any) => step.step === 'Tokens transferred');
    return tokensTransferred?.receipt || null;
  } catch (err: any) {
    console.error('Error fetching transaction timeline from Juno:', err?.response?.data || err?.message || err);
    return null;
  }
}


export async function sendJunoPayment(clabe: string, amount: number, description: string) {
  const endpoint = '/withdrawals/';
  const url = `${JUNO_BASE_URL}${endpoint}`;
  const bodyObj = {
    currency: "mxn",
    protocol: "clabe",
    amount: String(amount),
    beneficiary: "Pago Kustodia", // or seller name if available
    clabe,
    notes_ref: description || "Pago Kustodia",
    numeric_ref: "1234567",
    rfc: "XAXX010101000",
    origin_id: "kustodia_test",
  };
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = "POST";
  const requestPath = "/api/v3/withdrawals/";
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac("sha256", JUNO_API_SECRET).update(dataToSign).digest("hex");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  try {
    const response = await axios.post(url, bodyObj, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Juno payout error:', err?.response?.data || err?.message || err);
    throw err;
  }
}
/**
 * Lista todas las transacciones de la cuenta Juno.
 * @param isStage Si es true usa el endpoint de stage, si no el de producción
 * @returns Array de transacciones Juno
 */
export async function listJunoTransactions(isStage = true) {
  const baseUrl = isStage
    ? 'https://stage.buildwithjuno.com'
    : 'https://buildwithjuno.com';
  const url = `${baseUrl}/mint_platform/v1/transactions`;
  const requestPath = '/mint_platform/v1/transactions';
  const method = 'GET';
  const nonce = Date.now().toString();
  const body = '';
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };
  const response = await axios.get(url, { headers });
  // LOG para depuración:
  console.log('[JUNO] listJunoTransactions response:', JSON.stringify(response.data));
  if (response.data && response.data.payload && Array.isArray(response.data.payload.content)) {
    return response.data.payload.content;
  }
  return [];
}