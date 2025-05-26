import axios from "axios";
import crypto from "crypto";

const JUNO_API_KEY = process.env.JUNO_ENV === 'stage'
  ? process.env.JUNO_STAGE_API_KEY!
  : process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = process.env.JUNO_ENV === 'stage'
  ? process.env.JUNO_STAGE_API_SECRET!
  : process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = process.env.JUNO_ENV === 'stage'
  ? 'https://stage.buildwithjuno.com/mint_platform/v1'
  : 'https://api.buildwithjuno.com/mint_platform/v1';

// --- New utilities for Juno MXNB redemption & payout ---

/**
 * Redeem MXNB to MXN via Juno
 * @param amount Amount in MXNB
 * @param destination_bank_account_id Juno bank account ID
 */
// Register a CLABE as a bank account in Juno
export async function registerJunoBankAccount(clabe: string, recipient_legal_name: string, tag?: string) {
  const url = `${JUNO_BASE_URL}/accounts/banks`;
  const body = {
    clabe,
    recipient_legal_name,
    tag: tag || undefined
  };
  const headers: any = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUNO_API_KEY}`
  };
  return (await axios.post(url, body, { headers })).data;
}

// Lookup the Juno bank account ID for a given CLABE
export async function getJunoBankAccountIdForClabe(clabe: string): Promise<string | null> {
  const url = `${JUNO_BASE_URL}/accounts/banks`;
  const headers: any = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUNO_API_KEY}`
  };
  const res = await axios.get(url, { headers });
  const accounts = res.data?.payload || [];
  const found = accounts.find((acc: any) => acc.clabe === clabe);
  return found ? found.id : null;
}

// Redeem MXNB to MXN via Juno, accepting CLABE
export async function redeemMXNbForMXN(amount: number, payout_clabe: string, recipient_legal_name: string) {
  let destination_bank_account_id = await getJunoBankAccountIdForClabe(payout_clabe);
  if (!destination_bank_account_id) {
    // Register the CLABE if not present
    await registerJunoBankAccount(payout_clabe, recipient_legal_name);
    // Try again
    destination_bank_account_id = await getJunoBankAccountIdForClabe(payout_clabe);
    if (!destination_bank_account_id) throw new Error('Failed to register and resolve Juno bank account ID for CLABE');
  }
  const url = `${JUNO_BASE_URL}/redemptions`;
  const body = {
    amount,
    destination_bank_account_id,
    asset: "mxn"
  };
  const headers: any = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUNO_API_KEY}`
  };
  console.log('[JUNO REDEEM REQUEST]', { url, body, headers });
  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error('[JUNO REDEEM ERROR]', {
        url,
        body,
        headers,
        status: err.response.status,
        data: err.response.data
      });
    } else {
      console.error('[JUNO REDEEM ERROR]', err);
    }
    throw err;
  }
}

/**
 * Get Juno transactions (for polling redemption status)
 */
export async function getJunoTransactions(params: Record<string, any> = {}) {
  const url = `${JUNO_BASE_URL}/transactions`;
  const headers: any = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUNO_API_KEY}`
  };
  return (await axios.get(url, { headers, params })).data;
}

/**
 * Send MXN payout from Juno account to bank account (if required)
 */
// Send MXN payout from Juno account to bank account (if required), accepting CLABE
export async function sendMxnPayout(amount: number, payout_clabe: string, recipient_legal_name: string) {
  let destination_bank_account_id = await getJunoBankAccountIdForClabe(payout_clabe);
  if (!destination_bank_account_id) {
    // Register the CLABE if not present
    await registerJunoBankAccount(payout_clabe, recipient_legal_name);
    // Try again
    destination_bank_account_id = await getJunoBankAccountIdForClabe(payout_clabe);
    if (!destination_bank_account_id) throw new Error('Failed to register and resolve Juno bank account ID for CLABE');
  }
  const url = `${JUNO_BASE_URL}/withdrawals`;
  const body = {
    amount,
    destination_bank_account_id,
    currency: "mxn"
  };
  const headers: any = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUNO_API_KEY}`
  };
  console.log('[JUNO PAYOUT REQUEST]', { url, body, headers });
  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error('[JUNO PAYOUT ERROR]', {
        url,
        body,
        headers,
        status: err.response.status,
        data: err.response.data
      });
    } else {
      console.error('[JUNO PAYOUT ERROR]', err);
    }
    throw err;
  }
}


function generateNonce() {
  return Date.now().toString();
}

function generateSignature(nonce: string, body: string) {
  // Juno HMAC signing: HMAC_SHA256(secret, nonce + body)
  return crypto.createHmac("sha256", JUNO_API_SECRET)
    .update(nonce + body)
    .digest("hex");
}

export async function sendJunoPayout({ amount, beneficiary, clabe, notes_ref, numeric_ref, rfc, origin_id }: {
  amount: number;
  beneficiary: string;
  clabe: string;
  notes_ref?: string;
  numeric_ref?: string;
  rfc?: string;
  origin_id?: string;
}) {
  const endpoint = "/withdrawals/";
  const url = `${JUNO_BASE_URL}${endpoint}`;
  const bodyObj = {
    currency: "mxn",
    protocol: "clabe",
    amount: String(amount),
    beneficiary,
    clabe,
    notes_ref: notes_ref || "Pago Kustodia",
    numeric_ref: numeric_ref || "1234567",
    rfc: rfc || "XAXX010101000",
    origin_id: origin_id || "kustodia_test",
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
  const response = await axios.post(url, bodyObj, { headers });
  return response.data;
}

// Redención de MXNB a MXN
export async function sendJunoRedemption({ amount, notes_ref }: {
  amount: number;
  notes_ref?: string;
}) {
  const endpoint = "/withdrawals/";
  const url = `${JUNO_BASE_URL}${endpoint}`;
  const bodyObj = {
    amount: String(amount),
    destination: "mxn",
    currency: "mxn",
    network: "spei",
    notes_ref: notes_ref || "Redención MXNB para payout"
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
  const response = await axios.post(url, bodyObj, { headers });
  return response.data;
}
