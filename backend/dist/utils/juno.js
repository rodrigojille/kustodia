"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarClabeJuno = generarClabeJuno;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function generarClabeJuno() {
    const API_KEY = process.env.JUNO_API_KEY;
    const API_SECRET = process.env.JUNO_API_SECRET;
    const nonce = Date.now().toString();
    const httpMethod = 'POST';
    const requestPath = '/mint_platform/v1/clabes';
    const jsonPayload = '{}';
    const message = nonce + httpMethod + requestPath + jsonPayload;
    const signature = crypto_1.default.createHmac('sha256', API_SECRET).update(message).digest('hex');
    const authHeader = `Bitso ${API_KEY}:${nonce}:${signature}`;
    const response = await axios_1.default.post('https://stage.buildwithjuno.com/mint_platform/v1/clabes', {}, { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } });
    return response.data.payload.clabe;
}
