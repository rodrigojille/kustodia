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
export async function redeemMXNbForMXN(amount: number, destination_bank_account_id: string) {
  const endpoint = '/mint_platform/v1/redemptions';
  const url = `${JUNO_BASE_URL}${endpoint}`;
  const bodyObj = {
    amount: amount, // Keep amount as string
    destination_bank_account_id,
    asset: 'mxn', // The asset being redeemed is MXNB
  };
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    
  };

  console.log(`[JUNO] Redeeming ${amount} MXNB to bank account ${destination_bank_account_id}...`);
  console.log(`[JUNO] Request Body: ${body}`);

  try {
    const response = await axios.post(url, bodyObj, { headers });
    // The documentation shows the transaction details are in the 'payload' object
    if (response.data && response.data.success) {
      return response.data.payload;
    }
    throw new Error('Juno redemption response was not successful: ' + JSON.stringify(response.data));
  } catch (err: any) {
    console.error('Juno redemption error:', JSON.stringify(err.response.data, null, 2) || err?.message || err);
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



/**
 * Lista todas las transacciones de la cuenta Juno.
 * @param isStage Si es true usa el endpoint de stage, si no el de producción
 * @returns Array de transacciones Juno
 */
export async function withdrawCryptoToBridgeWallet(amount: number, destinationAddress: string) {
  const endpoint = '/mint_platform/v1/withdrawals';
  const url = `${JUNO_BASE_URL}${endpoint}`;

  const bodyObj = {
    amount: amount,
    asset: 'MXNB',
    address: destinationAddress,
    blockchain: 'ARBITRUM'
  };
  const body = JSON.stringify(bodyObj);
  const nonce = Date.now().toString();
  const method = 'POST';
  const requestPath = endpoint;
  const dataToSign = nonce + method + requestPath + body;
  const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
  };

  console.log('Enviando withdrawal de MXNB via junoService...');
  console.log('Destino:', destinationAddress);
  console.log('Monto:', amount);
  console.log('Payload:', JSON.stringify(bodyObj));

  try {
    const response = await axios.post(url, bodyObj, { headers, timeout: 15000 }); // 15-second timeout
    console.log('Respuesta withdrawal:', response.data);
    return response.data;
  } catch (err: any) {
    console.error('Error en withdrawal desde junoService:', err?.response?.data || err?.message || err);
    throw err;
  }
}

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