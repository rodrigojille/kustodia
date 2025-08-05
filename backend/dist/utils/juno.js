"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarClabeJuno = generarClabeJuno;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const networkConfig_1 = require("./networkConfig");
dotenv_1.default.config();
async function generarClabeJuno() {
    const networkConfig = (0, networkConfig_1.getCurrentNetworkConfig)();
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
        ? process.env.JUNO_PROD_BASE_URL
        : process.env.JUNO_STAGE_BASE_URL;
    const nonce = Date.now().toString(); // Integer timestamp in milliseconds
    const httpMethod = 'POST';
    const requestPath = '/mint_platform/v1/clabes';
    const jsonPayload = '{}';
    const message = nonce + httpMethod + requestPath + jsonPayload;
    const signature = crypto_1.default.createHmac('sha256', API_SECRET).update(message).digest('hex');
    const authHeader = `Bitso ${API_KEY}:${nonce}:${signature}`;
    console.log('--- JUNO CLABE DEBUG (generarClabeJuno) ---');
    console.log('Environment:', networkConfig.junoEnv);
    console.log('API Key:', API_KEY);
    console.log('Base URL:', baseUrl);
    console.log('String to sign:', message);
    console.log('Signature:', signature);
    console.log('Auth Header:', authHeader);
    const response = await axios_1.default.post(`${baseUrl}/mint_platform/v1/clabes`, {}, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } });
    return response.data.payload.clabe;
}
