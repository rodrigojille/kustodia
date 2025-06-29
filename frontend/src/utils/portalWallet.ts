import { getPortalInstance } from './portalInstance';
import { ethers } from 'ethers';
import KustodiaEscrowABI from '../abis/KustodiaEscrow3_0.json';

export async function ensurePortalWallet(token: string): Promise<string | null> {
  // Fetch user profile from backend
  const res = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const { user } = await res.json();
  
  // If user doesn't exist, return null
  if (!user) return null;
  
  // If user already has a wallet address, return it
  if (user.wallet_address) {
    console.log("User already has wallet address:", user.wallet_address);
    return user.wallet_address;
  }

  // User doesn't have a wallet address, create one with Portal SDK
  console.log("User has no wallet address, creating new Portal wallet...");
  
  // Defensive checks for env variables
  if (!process.env.NEXT_PUBLIC_PORTAL_API_KEY) {
    throw new Error("Portal API key missing in environment");
  }
  const rpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
  if (!rpcUrl) {
    throw new Error("Arbitrum Sepolia RPC URL missing in environment");
  }
  
  console.log("Creating Portal wallet with config:", {
    apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY,
    rpcConfig: { 'eip155:421614': rpcUrl }
  });
  
  // Create wallet using Portal SDK
  const portal = await getPortalInstance();
  if (!portal) throw new Error("Portal SDK is only available in the browser");
  
  await portal.onReady(() => {});
  
  // Check if Portal wallet exists locally
  const exists = await portal.doesWalletExist();
  if (!exists) {
    console.log("Creating new Portal wallet...");
    await portal.createWallet();
  } else {
    console.log("Portal wallet already exists locally");
  }
  
  const ethAddress = await portal.getEip155Address();
  console.log("Portal wallet address:", ethAddress);

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

export async function signContractInteraction(contractAddress: string, functionName: string, args: any[]): Promise<string> {
  const portal = await getPortalInstance();
  if (!portal) {
    throw new Error('Portal SDK is only available in the browser');
  }

  await portal.onReady(() => {});

  const provider = new ethers.BrowserProvider(portal.provider);
  const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, KustodiaEscrowABI, signer);

  const tx = await contract[functionName](...args);
  await tx.wait();

  return tx.hash;
}
