"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JUNO_ENV = process.env.JUNO_ENV || 'stage';
const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
// Mock Deposit Configuration - simulates external SPEI deposit for Payment 89
// Using Payment 89's CLABE from frontend
const DEPOSIT_CLABE = '710969000000401454'; // Payment 90's CLABE
const DEPOSIT_AMOUNT = '30000.00'; // Payment 90's amount: $30,000.00
const RECEIVER_CLABE = DEPOSIT_CLABE; // CLABE for the deposit
const RECEIVER_NAME = process.env.JUNO_BRIDGE_NAME; // Nombre registrado en Juno
const SENDER_CLABE = process.env.JUNO_TEST_SENDER_CLABE; // Optional: Will not be sent if not in .env
const SENDER_NAME = process.env.JUNO_TEST_SENDER_NAME || RECEIVER_NAME;
const AMOUNT = DEPOSIT_AMOUNT;
if (!JUNO_API_KEY || !JUNO_API_SECRET)
    throw new Error('Faltan credenciales de Juno en .env');
if (!RECEIVER_NAME)
    throw new Error('Falta JUNO_BRIDGE_NAME en .env');
console.log('🎯 Configurado para enviar depósito a CLABE:', RECEIVER_CLABE);
async function main() {
    const endpoint = '/spei/test/deposits';
    const url = `${BASE_URL}${endpoint}`;
    const bodyObj = {
        amount: AMOUNT,
        receiver_clabe: RECEIVER_CLABE,
        receiver_name: RECEIVER_NAME,
        sender_name: SENDER_NAME,
    };
    if (SENDER_CLABE) {
        bodyObj.sender_clabe = SENDER_CLABE;
    }
    const body = JSON.stringify(bodyObj);
    const nonce = Date.now().toString();
    const method = 'POST';
    const requestPath = endpoint;
    const dataToSign = nonce + method + requestPath + body;
    const signature = crypto_1.default.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    console.log('🏦 Enviando mock deposit (simula SPEI externo)');
    console.log('CLABE:', RECEIVER_CLABE);
    console.log('Nombre:', RECEIVER_NAME);
    console.log('Monto:', AMOUNT);
    console.log('Descripción: Test automation - External SPEI deposit');
    try {
        const response = await axios_1.default.post(url, bodyObj, { headers });
        console.log('Respuesta mock deposit:', response.data);
    }
    catch (err) {
        console.error('Error en mock deposit:', err?.response?.data || err?.message || err);
        process.exit(1);
    }
}
main();
