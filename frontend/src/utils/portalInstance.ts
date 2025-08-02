let portal: any = null;

export async function getPortalInstance() {
  if (typeof window === "undefined") return null;
  if (!portal) {
    // Validate Portal API key before initialization
    const portalApiKey = process.env.NEXT_PUBLIC_PORTAL_API_KEY;
    const isValidKey = portalApiKey && 
      portalApiKey !== 'your_portal_api_key_from_netlify' && 
      portalApiKey !== 'your_portal_api_key_here' &&
      portalApiKey.length > 10 && 
      !portalApiKey.includes('XXXXXXXXXX');
    
    if (!isValidKey) {
      console.warn('⚠️ Portal SDK disabled: Invalid or placeholder API key detected. Set NEXT_PUBLIC_PORTAL_API_KEY in environment variables.');
      return null;
    }
    
    try {
      const portalImport = await import("@portal-hq/web");
      console.log("[DEBUG] Portal import result:", portalImport);
      const Portal = portalImport.default || portalImport;
      
      // Extract numeric chain ID from eip155:421614 format
      const chainIdWithPrefix = process.env.NEXT_PUBLIC_CHAIN_ID!; // "eip155:421614"
      const numericChainId = chainIdWithPrefix.includes(':') 
        ? chainIdWithPrefix.split(':')[1] 
        : chainIdWithPrefix;
      
      portal = new Portal({
        apiKey: portalApiKey,
        autoApprove: true,
        rpcConfig: { 
          [`eip155:${numericChainId}`]: 'https://api.portalhq.io/rpc/v1/eip155/421614' // Portal's official Arbitrum Sepolia RPC
        },
      });
      
      console.log("✅ Portal instance created successfully with autoApprove:", portal);
    } catch (error) {
      console.warn('⚠️ Portal SDK initialization failed:', error);
      return null;
    }
  }
  return portal;
}
