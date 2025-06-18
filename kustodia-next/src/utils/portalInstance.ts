let portal: any = null;

export async function getPortalInstance() {
  if (typeof window === "undefined") return null;
  if (!portal) {
    const portalImport = await import("@portal-hq/web");
    console.log("[DEBUG] Portal import result:", portalImport);
    const Portal = portalImport.default || portalImport;
    portal = new Portal({
      apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY!,
      rpcConfig: { default: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL! },
    });
    console.log("[DEBUG] Portal instance created:", portal);
    // @ts-ignore
    if (typeof portal.on === "function") {
      console.log("[DEBUG] Registering portal_signingRequested event handler");
      portal.on("portal_signingRequested", async (request: any) => {
        console.log("[DEBUG] portal_signingRequested event triggered", request);
        await request.approve();
        console.log("[DEBUG] portal_signingRequested event auto-approved");
      });
    } else {
      console.error("[ERROR] portal.on is not a function. Portal instance:", portal);
    }
  }
  return portal;
}
