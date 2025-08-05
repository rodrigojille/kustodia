import axios from "axios";
import crypto from "crypto";
import { getCurrentNetworkConfig } from './networkConfig';

// Get network configuration for dynamic environment switching
function getJunoConfig() {
  const networkConfig = getCurrentNetworkConfig();
  const baseUrl = networkConfig.junoEnv === 'production' 
    ? `${process.env.JUNO_PROD_BASE_URL!}/api/v3`
    : `${process.env.JUNO_STAGE_BASE_URL!}/api/v3`;
  
  return {
    apiKey: networkConfig.junoApiKey,
    apiSecret: process.env.JUNO_API_SECRET!, // Keep secret in env
    baseUrl
  };
}

function generateNonce() {
  return Date.now().toString();
}

function generateSignature(nonce: string, body: string, apiSecret: string) {
  // Juno HMAC signing: HMAC_SHA256(secret, nonce + body)
  return crypto.createHmac("sha256", apiSecret)
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
  const junoConfig = getJunoConfig();
  const endpoint = "/withdrawals/";
  const url = `${junoConfig.baseUrl}${endpoint}`;
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
  const signature = crypto.createHmac("sha256", junoConfig.apiSecret).update(dataToSign).digest("hex");
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bitso ${junoConfig.apiKey}:${nonce}:${signature}`,
  };
  const response = await axios.post(url, bodyObj, { headers });
  return response.data;
}
