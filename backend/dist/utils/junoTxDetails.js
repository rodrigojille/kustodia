"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJunoTxDetails = fetchJunoTxDetails;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const networkConfig_1 = require("./networkConfig");
// Get Juno configuration dynamically
function getJunoConfig() {
    const networkConfig = (0, networkConfig_1.getCurrentNetworkConfig)();
    return {
        apiKey: networkConfig.junoApiKey,
        apiSecret: process.env.JUNO_API_SECRET, // Keep secret in env
        baseUrl: networkConfig.junoEnv === 'production'
            ? process.env.JUNO_PROD_BASE_URL
            : process.env.JUNO_STAGE_BASE_URL
    };
}
function getJunoAuthHeaders(method, path, body = "") {
    const junoConfig = getJunoConfig();
    const nonce = Date.now().toString();
    const stringToSign = `${nonce}${method}${path}${body}`;
    const signature = crypto_1.default
        .createHmac('sha256', junoConfig.apiSecret)
        .update(stringToSign)
        .digest('hex');
    const header = `Bitso ${junoConfig.apiKey}:${nonce}:${signature}`;
    return {
        'Authorization': header,
        'Content-Type': 'application/json'
    };
}
async function fetchJunoTxDetails(transaction_id) {
    const junoConfig = getJunoConfig();
    const path = `/mint_platform/v1/transactions/${transaction_id}`;
    const url = `${junoConfig.baseUrl}${path}`;
    const headers = getJunoAuthHeaders("POST", path);
    const response = await axios_1.default.post(url, {}, { headers });
    return response.data.payload;
}
