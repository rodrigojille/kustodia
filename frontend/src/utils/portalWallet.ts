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
  
  // If user already has a wallet address, use it (don't create new one)
  if (user.wallet_address) {
    console.log("✅ User has existing wallet:", user.wallet_address);
    
    // If user has portal_share, try to restore Portal wallet
    if (user.portal_share) {
      console.log("🔄 Attempting to restore Portal wallet from stored share...");
      try {
        const portal = await getPortalInstance();
        if (!portal) throw new Error("Portal SDK is only available in the browser");
        
        await portal.onReady(() => {});
        
        // Check if Portal wallet exists locally
        const exists = await portal.doesWalletExist();
        if (!exists) {
          console.log("⚠️ Portal wallet not found locally. User should use dashboard 'Create Wallet' button first.");
        } else {
          const portalAddress = await portal.getEip155Address();
          console.log("🔍 Portal wallet address:", portalAddress);
          
          if (portalAddress.toLowerCase() !== user.wallet_address.toLowerCase()) {
            console.warn("⚠️ Portal wallet mismatch! Database:", user.wallet_address, "Portal:", portalAddress);
            console.warn("💡 User should use dashboard 'Create Wallet' button to fix this.");
          } else {
            console.log("✅ Portal wallet matches database wallet");
          }
        }
      } catch (error) {
        console.warn("⚠️ Failed to restore Portal wallet:", error);
        console.warn("💡 User should use dashboard 'Create Wallet' button.");
      }
    } else {
      console.log("ℹ️ User has wallet but no portal_share. Wallet was created outside Portal.");
    }
    
    return user.wallet_address;
  }

  // User has no wallet - they need to create one using dashboard button
  console.log("❌ User has no wallet address.");
  console.log("💡 Please use the 'Create Wallet' button in the dashboard first.");
  throw new Error("No wallet found. Please create a wallet using the dashboard first.");
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
