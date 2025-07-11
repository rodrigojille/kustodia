let portal: any = null;

export async function getPortalInstance() {
  if (typeof window === "undefined") return null;
  if (!portal) {
    const portalImport = await import("@portal-hq/web");
    console.log("[DEBUG] Portal import result:", portalImport);
    const Portal = portalImport.default || portalImport;
    
    portal = new Portal({
      apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY!,
      autoApprove: true,
      rpcConfig: { 
        [process.env.NEXT_PUBLIC_CHAIN_ID!]: 'https://api.portalhq.io/rpc/v1/eip155/421614' // Portal's official Arbitrum Sepolia RPC
      },
    });
    
    console.log("[DEBUG] Portal instance created with autoApprove:", portal);
  }
  return portal;
}
