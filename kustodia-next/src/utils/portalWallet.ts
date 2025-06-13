import Portal from '@portal-hq/web';

export async function ensurePortalWallet(token: string): Promise<string | null> {
  // Fetch user profile from backend
  const res = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const { user } = await res.json();
  if (!user || user.wallet_address) return user.wallet_address || null;

  // Create wallet using Portal SDK
  const portal = new Portal({
    apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY!,
    rpcConfig: { default: 'https://rpc.ankr.com/eth_sepolia' }, // Replace with your preferred default or env
  });
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
