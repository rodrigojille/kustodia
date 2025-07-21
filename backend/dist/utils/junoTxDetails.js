"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJunoTxDetails = fetchJunoTxDetails;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || "https://stage.buildwithjuno.com";
function getJunoAuthHeaders(method, path, body = "") {
    const nonce = Date.now().toString();
    const stringToSign = `${nonce}${method}${path}${body}`;
    const signature = crypto_1.default
        .createHmac('sha256', JUNO_API_SECRET)
        .update(stringToSign)
        .digest('hex');
    const header = `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`;
    return {
        'Authorization': header,
        'Content-Type': 'application/json'
    };
}
async function fetchJunoTxDetails(transaction_id) {
    const path = `/mint_platform/v1/transactions/${transaction_id}`;
    const url = `${JUNO_BASE_URL}${path}`;
    const headers = getJunoAuthHeaders("POST", path);
    const response = await axios_1.default.post(url, {}, { headers });
    return response.data.payload;
}
