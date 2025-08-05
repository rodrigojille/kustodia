import axios from "axios";
import crypto from "crypto";
import { getCurrentNetworkConfig } from './networkConfig';

// Get Juno configuration dynamically
function getJunoConfig() {
  const networkConfig = getCurrentNetworkConfig();
  return {
    apiKey: networkConfig.junoApiKey,
    apiSecret: process.env.JUNO_API_SECRET!, // Keep secret in env
    baseUrl: networkConfig.junoEnv === 'production' 
      ? process.env.JUNO_PROD_BASE_URL! 
      : process.env.JUNO_STAGE_BASE_URL!
  };
}

function getJunoAuthHeaders(method: string, path: string, body: string = "") {
  const junoConfig = getJunoConfig();
  const nonce = Date.now().toString();
  const stringToSign = `${nonce}${method}${path}${body}`;
  const signature = crypto
    .createHmac('sha256', junoConfig.apiSecret)
    .update(stringToSign)
    .digest('hex');
  const header = `Bitso ${junoConfig.apiKey}:${nonce}:${signature}`;
  return {
    'Authorization': header,
    'Content-Type': 'application/json'
  };
}

export async function fetchJunoTxDetails(transaction_id: string) {
  const junoConfig = getJunoConfig();
  const path = `/mint_platform/v1/transactions/${transaction_id}`;
  const url = `${junoConfig.baseUrl}${path}`;
  const headers = getJunoAuthHeaders("POST", path);
  const response = await axios.post(url, {}, { headers });
  return response.data.payload;
}
