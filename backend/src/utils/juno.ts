import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export async function generarClabeJuno(): Promise<string> {
  const API_KEY = process.env.JUNO_API_KEY;
  const API_SECRET = process.env.JUNO_API_SECRET;
  const nonce = Date.now().toString();
  const httpMethod = 'POST';
  const requestPath = '/mint_platform/v1/clabes';
  const jsonPayload = '{}';
  const message = nonce + httpMethod + requestPath + jsonPayload;
  const signature = crypto.createHmac('sha256', API_SECRET!).update(message).digest('hex');
  const authHeader = `Bitso ${API_KEY}:${nonce}:${signature}`;
  const response = await axios.post(
    'https://stage.buildwithjuno.com/mint_platform/v1/clabes',
    {},
    { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
  );
  return response.data.payload.clabe;
}
