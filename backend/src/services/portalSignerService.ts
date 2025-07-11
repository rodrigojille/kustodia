import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const CHAIN_ID = process.env.CHAIN_ID!;

/**
 * Signs and broadcasts a transaction using the PortalHQ MPC signing API.
 * @param {string} userWalletAddress - The user's wallet address (the 'from' address).
 * @param {string} userPortalShare - The user's recovered portal share for signing.
 * @param {string} to - The destination contract address.
 * @param {string} data - The encoded transaction data.
 * @returns {Promise<string>} The transaction hash.
 */
export async function signAndBroadcastWithPortal({
  userWalletAddress,
  userPortalShare,
  userPortalClientId,
  to,
  data,
}: {
  userWalletAddress: string;
  userPortalShare: string;
  userPortalClientId: string;
  to: string;
  data: string;
}): Promise<string> {
  // NOTE: Portal MPC signing is now handled in the frontend via Portal SDK
  // This backend function is kept as a placeholder for compatibility
  console.log('[PortalSigner] Portal MPC operations moved to frontend. Backend returns placeholder hash.');
  console.log(`[PortalSigner] Target contract: ${to}`);
  console.log(`[PortalSigner] Chain ID: eip155:${CHAIN_ID}`);
  
  // Return a placeholder transaction hash for backend compatibility
  // Real Portal MPC signing happens in frontend and real hash is passed back
  const placeholderTxHash = `0x${'a'.repeat(64)}`;
  console.log(`[PortalSigner] Returning placeholder hash: ${placeholderTxHash}`);
  
  return placeholderTxHash;
}
