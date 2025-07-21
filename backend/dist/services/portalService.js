"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPortalClient = createPortalClient;
exports.getPortalWallet = getPortalWallet;
exports.getPortalWalletBalance = getPortalWalletBalance;
exports.transferMXNB = transferMXNB;
// src/services/portalService.ts
// Service for interacting with Portal HQ API for user wallet management
const axios_1 = __importDefault(require("axios"));
const PORTAL_CUSTODIAN_API_KEY = process.env.PORTAL_CUSTODIAN_API_KEY;
const PORTAL_API_URL = 'https://api.portalhq.io/v1';
const CHAIN = 'eip155:421614'; // Arbitrum Sepolia testnet in CAIP-2 format (Portal API requirement)
const MXNB_CONTRACT_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS || '0xYourMXNBAddress';
if (!PORTAL_CUSTODIAN_API_KEY)
    throw new Error('Missing PORTAL_CUSTODIAN_API_KEY in env');
/**
 * Creates a new client using the PortalHQ v3 Custodian API.
 * This will generate a new wallet and return the client object containing the address and portalShare.
 * @returns {Promise<any>} The client object from Portal API.
 */
async function createPortalClient() {
    const url = 'https://api.portalhq.io/v3/clients';
    try {
        const response = await axios_1.default.post(url, {}, {
            headers: {
                Authorization: `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.client;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error creating Portal client:', error.response?.data || error.message);
        }
        else {
            console.error('An unexpected error occurred while creating Portal client:', error);
        }
        throw new Error('Failed to create Portal client.');
    }
}
// DEPRECATED: Portal wallet creation and retrieval must be done in the frontend using the Portal Web SDK.
/*
// Create a Portal wallet for a user
export async function createPortalWallet(user: User) {
  const res = await axios.post(
    `${PORTAL_API_URL}/wallets`,
    {
      userId: user.id.toString(),
      chain: CHAIN,
    },
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data; // { id, address, ... }
}

*/
// Get a Portal wallet by userId
async function getPortalWallet(user) {
    const res = await axios_1.default.get(`${PORTAL_API_URL}/wallets/${user.id}`, {
        headers: {
            'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
        },
    });
    return res.data; // { id, address, ... }
}
// Get MXNB balance for a user's wallet
async function getPortalWalletBalance(walletId) {
    const res = await axios_1.default.get(`${PORTAL_API_URL}/wallets/${walletId}/assets`, {
        headers: {
            'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
        },
        params: {
            contractAddress: MXNB_CONTRACT_ADDRESS,
            chain: CHAIN,
        },
    });
    return res.data; // [{ asset, balance, ... }]
}
// Transfer MXNB from one wallet to another
async function transferMXNB(fromWalletId, toAddress, amount) {
    const res = await axios_1.default.post(`${PORTAL_API_URL}/transfers`, {
        fromWalletId,
        to: toAddress,
        asset: {
            type: 'erc20',
            contractAddress: MXNB_CONTRACT_ADDRESS,
            chain: CHAIN,
        },
        amount,
    }, {
        headers: {
            'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return res.data; // { txHash, ... }
}
