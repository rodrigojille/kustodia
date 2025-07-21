"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function main() {
    const JUNO_ENV = process.env.JUNO_ENV || 'stage';
    const JUNO_API_KEY = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_KEY : process.env.JUNO_API_KEY;
    const JUNO_API_SECRET = JUNO_ENV === 'stage' ? process.env.JUNO_STAGE_API_SECRET : process.env.JUNO_API_SECRET;
    const BASE_URL = JUNO_ENV === 'stage' ? 'https://stage.buildwithjuno.com' : 'https://buildwithjuno.com';
    const endpoint = '/mint_platform/v1/accounts/banks';
    const url = `${BASE_URL}${endpoint}`;
    const nonce = Date.now().toString();
    const method = 'GET';
    const requestPath = endpoint;
    const body = '';
    const dataToSign = nonce + method + requestPath + body;
    const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
    const signature = crypto.createHmac('sha256', JUNO_API_SECRET).update(dataToSign).digest('hex');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        const accounts = response.data?.payload || [];
        console.log('Bank Accounts (UUID <-> CLABE):');
        for (const acc of accounts) {
            console.log(`UUID: ${acc.id} | CLABE: ${acc.clabe} | Holder: ${acc.recipient_legal_name || acc.account_holder || ''} | Tag: ${acc.tag || ''}`);
        }
    }
    catch (err) {
        console.error('Error fetching bank accounts:', err?.response?.data || err?.message || err);
        process.exit(1);
    }
}
main();
