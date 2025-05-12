import axios from "axios";
import crypto from "crypto";

const JUNO_API_KEY = process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = "https://api.bitso.com/api/v3";

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
