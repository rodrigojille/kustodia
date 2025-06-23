let portal: any = null;

export async function getPortalInstance() {
  if (typeof window === "undefined") return null;
  if (!portal) {
    const portalImport = await import("@portal-hq/web");
    console.log("[DEBUG] Portal import result:", portalImport);
    const Portal = portalImport.default || portalImport;
    
    portal = new Portal({
      apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY!,
      autoApprove: true, // This replaces the manual event handler
      rpcConfig: { 
        'eip155:421614': process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL! // Arbitrum Sepolia
      },
    });
    
    console.log("[DEBUG] Portal instance created with autoApprove:", portal);
  }
  return portal;
}
