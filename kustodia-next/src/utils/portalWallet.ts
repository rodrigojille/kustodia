import { getPortalInstance } from './portalInstance';

export async function ensurePortalWallet(token: string): Promise<string | null> {
  // Fetch user profile from backend
  const res = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const { user } = await res.json();
  if (!user || user.wallet_address) return user.wallet_address || null;

  // Defensive checks for env variables
  if (!process.env.NEXT_PUBLIC_PORTAL_API_KEY) {
    throw new Error("Portal API key missing in environment");
  }
  const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
  if (!rpcUrl) {
    throw new Error("Arbitrum Sepolia RPC URL missing in environment");
  }
  console.log("ensurePortalWallet called with config:", {
    apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY,
    rpcConfig: { default: rpcUrl }
  });
  // Create wallet using Portal SDK
  const portal = await getPortalInstance();
  if (!portal) throw new Error("Portal SDK is only available in the browser");
  await portal.onReady(() => {});
  const exists = await portal.doesWalletExist();
  if (!exists) await portal.createWallet();
  const ethAddress = await portal.getEip155Address();

  // Update backend with new wallet address
  await fetch('/api/users/update-wallet-address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ wallet_address: ethAddress }),
  });
  return ethAddress;
}
