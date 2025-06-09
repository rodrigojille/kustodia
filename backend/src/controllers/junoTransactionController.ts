import { Request, Response } from "express";
import axios from "axios";

const JUNO_API_KEY = process.env.JUNO_API_KEY!;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET!;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || "https://stage.buildwithjuno.com";

function getJunoAuthHeaders(method: string, path: string, body: string = "") {
  const nonce = Date.now().toString();
  const stringToSign = `${nonce}${method}${path}${body}`;
  const signature = require('crypto')
    .createHmac('sha256', JUNO_API_SECRET)
    .update(stringToSign)
    .digest('hex');
  const header = `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`;
  return {
    'Authorization': header,
    'Content-Type': 'application/json'
  };
}

export const getJunoTxDetails = async (req: Request, res: Response): Promise<void> => {
  const { transaction_id } = req.params;
  if (!transaction_id) {
    res.status(400).json({ error: "Missing transaction_id" });
    return;
  }
  const path = `/mint_platform/v1/transactions/${transaction_id}`;
  const url = `${JUNO_BASE_URL}${path}`;
  const headers = getJunoAuthHeaders("POST", path);
  try {
    const response = await axios.post(url, {}, { headers });
    res.json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(502).json({ error: "Juno API error", details: error.response.data });
    } else {
      res.status(500).json({ error: "Unknown error", details: error.message });
    }
  }
};
