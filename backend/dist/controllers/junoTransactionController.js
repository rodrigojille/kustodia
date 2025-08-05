"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJunoTxDetails = void 0;
const axios_1 = __importDefault(require("axios"));
const networkConfig_1 = require("../utils/networkConfig");
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
    const signature = require('crypto')
        .createHmac('sha256', junoConfig.apiSecret)
        .update(stringToSign)
        .digest('hex');
    const header = `Bitso ${junoConfig.apiKey}:${nonce}:${signature}`;
    return {
        'Authorization': header,
        'Content-Type': 'application/json'
    };
}
const getJunoTxDetails = async (req, res) => {
    const { transaction_id } = req.params;
    if (!transaction_id) {
        res.status(400).json({ error: "Missing transaction_id" });
        return;
    }
    const junoConfig = getJunoConfig();
    const path = `/mint_platform/v1/transactions/${transaction_id}`;
    const url = `${junoConfig.baseUrl}${path}`;
    const headers = getJunoAuthHeaders("POST", path);
    try {
        const response = await axios_1.default.post(url, {}, { headers });
        res.json(response.data);
    }
    catch (error) {
        if (error.response) {
            res.status(502).json({ error: "Juno API error", details: error.response.data });
        }
        else {
            res.status(500).json({ error: "Unknown error", details: error.message });
        }
    }
};
exports.getJunoTxDetails = getJunoTxDetails;
