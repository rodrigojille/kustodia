// src/services/portalService.ts
// Service for interacting with Portal HQ API for user wallet management
import axios from 'axios';
import { User } from '../entity/User';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

const PORTAL_CUSTODIAN_API_KEY = process.env.PORTAL_CUSTODIAN_API_KEY;
const PORTAL_API_URL = 'https://api.portalhq.io/v1';
const CHAIN = 'eip155:421614'; // Arbitrum Sepolia testnet in CAIP-2 format (Portal API requirement)
const getMXNBContractAddress = () => getCurrentNetworkConfig().mxnbTokenAddress;

if (!PORTAL_CUSTODIAN_API_KEY) throw new Error('Missing PORTAL_CUSTODIAN_API_KEY in env');

/**
 * Creates a Portal client session using the Portal API Key.
 * This returns a Client Session Token that can be used to create wallets.
 * @param portalApiKey - Portal API key (Custodian API Key)
 * @returns Promise with the client response containing clientSessionToken and id
 */
export async function createPortalClientSession(portalApiKey: string): Promise<any> {
  console.log('[PORTAL] Creating Portal client session with API key:', portalApiKey ? `${portalApiKey.substring(0, 10)}...` : 'undefined');
  
  try {
    const response = await axios.post(
      'https://api.portalhq.io/api/v1/custodians/clients',
      {},
      {
        headers: {
          'Authorization': `Bearer ${portalApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[PORTAL] Portal client session created successfully:', {
      status: response.status,
      statusText: response.statusText,
      clientId: response.data.id
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Portal Client Session Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request URL:', error.config?.url);
      console.error('Request Headers:', error.config?.headers);
    } else {
      console.error('An unexpected error occurred while creating Portal client session:', error);
    }
    throw new Error(`Failed to create Portal client session: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a Portal wallet using a Client Session Token.
 * @param clientSessionToken - Client Session Token obtained from createPortalClientSession
 * @returns Promise with the Portal wallet response
 */
export async function createPortalWallet(clientSessionToken: string): Promise<any> {
  console.log('[PORTAL] Creating Portal wallet with client session token:', clientSessionToken ? `${clientSessionToken.substring(0, 10)}...` : 'undefined');
  
  try {
    const response = await axios.post(
      'https://mpc-client.portalhq.io/v1/generate',
      {},
      {
        headers: {
          'Authorization': `Bearer ${clientSessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[PORTAL] Portal wallet created successfully:', {
      status: response.status,
      statusText: response.statusText,
      hasSecp256k1: !!(response.data.secp256k1 || response.data.SECP256K1),
      hasEd25519: !!(response.data.ed25519 || response.data.ED25519)
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Portal Wallet Creation Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request URL:', error.config?.url);
      console.error('Request Headers:', error.config?.headers);
    } else {
      console.error('An unexpected error occurred while creating Portal wallet:', error);
    }
    throw new Error(`Failed to create Portal wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves the actual Web3 addresses for a Portal client.
 * @param clientSessionToken - Client Session Token obtained from createPortalClientSession
 * @returns Promise with the client details containing wallet addresses
 */
export async function getPortalClientDetails(clientSessionToken: string): Promise<any> {
  console.log('[PORTAL] Getting Portal client details with session token:', clientSessionToken ? `${clientSessionToken.substring(0, 10)}...` : 'undefined');
  
  try {
    const response = await axios.get(
      'https://api.portalhq.io/api/v3/clients/me',
      {
        headers: {
          'Authorization': `Bearer ${clientSessionToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[PORTAL] Portal client details retrieved successfully:', {
      status: response.status,
      statusText: response.statusText,
      hasMetadata: !!response.data.metadata,
      hasNamespaces: !!(response.data.metadata?.namespaces),
      ethereumAddress: response.data.metadata?.namespaces?.eip155?.address
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Portal Client Details Error:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request URL:', error.config?.url);
    } else {
      console.error('An unexpected error occurred while getting Portal client details:', error);
    }
    throw new Error(`Failed to get Portal client details: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Notifies Portal that the signing shares have been stored securely.
 * This is required as a wallet safeguarding measure.
 * @param apiKey - Portal API key
 * @param shareIds - Array of share IDs to mark as stored
 */
export async function notifyPortalSharesStored(apiKey: string, shareIds: string[]): Promise<void> {
  console.log('[PORTAL] Notifying Portal about stored shares:', shareIds);
  
  try {
    const response = await axios.patch(
      'https://api.portalhq.io/api/v3/clients/me/signing-share-pairs',
      {
        status: 'STORED_CLIENT',
        signingSharePairIds: shareIds
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[PORTAL] Portal shares notification successful:', {
      status: response.status,
      statusText: response.statusText
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Portal Shares Notification Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request URL:', error.config?.url);
    } else {
      console.error('An unexpected error occurred while notifying Portal about stored shares:', error);
    }
    throw new Error(`Failed to notify Portal about stored shares: ${error instanceof Error ? error.message : String(error)}`);
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
export async function getPortalWallet(user: User) {
  const res = await axios.get(
    `${PORTAL_API_URL}/wallets/${user.id}`,
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
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
        'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
      },
      params: {
        contractAddress: getMXNBContractAddress(),
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
        contractAddress: getMXNBContractAddress(),
        chain: CHAIN,
      },
      amount,
    },
    {
      headers: {
        'Authorization': `Bearer ${PORTAL_CUSTODIAN_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data; // { txHash, ... }
}
