import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getCurrentNetworkConfig } from './networkConfig';
dotenv.config();

export async function generarClabeJuno(): Promise<string> {
  const networkConfig = getCurrentNetworkConfig();
  const API_KEY = networkConfig.junoApiKey;
  
  // Load the correct API secret based on environment
  const API_SECRET = networkConfig.junoEnv === 'production' 
    ? process.env.JUNO_PROD_API_SECRET 
    : process.env.JUNO_STAGE_API_SECRET;
  
  if (!API_SECRET) {
    throw new Error(`Missing Juno API secret for ${networkConfig.junoEnv} environment`);
  }
  
  // Determine base URL based on environment
  const baseUrl = networkConfig.junoEnv === 'production' 
    ? process.env.JUNO_PROD_BASE_URL! 
    : process.env.JUNO_STAGE_BASE_URL!;
  
  const nonce = Date.now().toString(); // Integer timestamp in milliseconds
  const httpMethod = 'POST';
  const requestPath = '/mint_platform/v1/clabes';
  const jsonPayload = '{}';
  const message = nonce + httpMethod + requestPath + jsonPayload;
  const signature = crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
  const authHeader = `Bitso ${API_KEY}:${nonce}:${signature}`;
  
  console.log('--- JUNO CLABE DEBUG (generarClabeJuno) ---');
  console.log('Environment:', networkConfig.junoEnv);
  console.log('API Key:', API_KEY);
  console.log('Base URL:', baseUrl);
  console.log('String to sign:', message);
  console.log('Signature:', signature);
  console.log('Auth Header:', authHeader);
  
  const response = await axios.post(
    `${baseUrl}/mint_platform/v1/clabes`,
    {},
    { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
  );
  return response.data.payload.clabe;
}
