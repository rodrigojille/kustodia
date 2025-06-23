// src/services/portalService.ts
// Service for interacting with Portal HQ API for user wallet management
import axios from 'axios';
import { User } from '../entity/User';

const PORTAL_API_KEY = process.env.PORTAL_API_KEY;
const PORTAL_API_URL = 'https://api.portalhq.io/v1';
const CHAIN = 'arbitrum'; // or use chainId if needed
const MXNB_CONTRACT_ADDRESS = process.env.MXNB_CONTRACT_ADDRESS || '0xYourMXNBAddress';

if (!PORTAL_API_KEY) throw new Error('Missing PORTAL_API_KEY in env');

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
        'Authorization': `Bearer ${PORTAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data; // { id, address, ... }
}

*/
// Get a Portal wallet by userId
export async function getPortalWallet(user: User) {
  const res = await axios.get(
    `${PORTAL_API_URL}/wallets/${user.id}`,
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_API_KEY}`,
      },
    }
  );
  return res.data; // { id, address, ... }
}

// Get MXNB balance for a user's wallet
export async function getPortalWalletBalance(walletId: string) {
  const res = await axios.get(
    `${PORTAL_API_URL}/wallets/${walletId}/assets`,
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_API_KEY}`,
      },
      params: {
        contractAddress: MXNB_CONTRACT_ADDRESS,
        chain: CHAIN,
      },
    }
  );
  return res.data; // [{ asset, balance, ... }]
}

// Transfer MXNB from one wallet to another
export async function transferMXNB(fromWalletId: string, toAddress: string, amount: string) {
  const res = await axios.post(
    `${PORTAL_API_URL}/transfers`,
    {
      fromWalletId,
      to: toAddress,
      asset: {
        type: 'erc20',
        contractAddress: MXNB_CONTRACT_ADDRESS,
        chain: CHAIN,
      },
      amount,
    },
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data; // { txHash, ... }
}
