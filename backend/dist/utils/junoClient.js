"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJunoPayout = sendJunoPayout;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = "https://api.bitso.com/api/v3";
function generateNonce() {
    return Date.now().toString();
}
function generateSignature(nonce, body) {
    // Juno HMAC signing: HMAC_SHA256(secret, nonce + body)
    return crypto_1.default.createHmac("sha256", JUNO_API_SECRET)
        .update(nonce + body)
        .digest("hex");
}
async function sendJunoPayout({ amount, beneficiary, clabe, notes_ref, numeric_ref, rfc, origin_id }) {
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
    const signature = crypto_1.default.createHmac("sha256", JUNO_API_SECRET).update(dataToSign).digest("hex");
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bitso ${JUNO_API_KEY}:${nonce}:${signature}`,
    };
    const response = await axios_1.default.post(url, bodyObj, { headers });
    return response.data;
}
