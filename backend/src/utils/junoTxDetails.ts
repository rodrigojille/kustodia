import axios from "axios";
import crypto from "crypto";

const JUNO_API_KEY = process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || "https://stage.buildwithjuno.com";

function getJunoAuthHeaders(method: string, path: string, body: string = "") {
  const nonce = Date.now().toString();
  const stringToSign = `${nonce}${method}${path}${body}`;
  const signature = crypto
    .createHmac('sha256', JUNO_API_SECRET)
    .update(stringToSign)
    .digest('hex');
  const header = `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`;
  return {
    'Authorization': header,
    'Content-Type': 'application/json'
  };
}

export async function fetchJunoTxDetails(transaction_id: string) {
  const path = `/mint_platform/v1/transactions/${transaction_id}`;
  const url = `${JUNO_BASE_URL}${path}`;
  const headers = getJunoAuthHeaders("POST", path);
  const response = await axios.post(url, {}, { headers });
  return response.data.payload;
}
