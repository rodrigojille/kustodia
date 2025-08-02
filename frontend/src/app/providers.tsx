"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import Portal from '@portal-hq/web';

// Define the shape of the context
interface IPortalContext {
  portal: Portal | null;
  isReady: boolean;
}

// Create the context with a default value
const PortalContext = createContext<IPortalContext>({ portal: null, isReady: false });

// Create the Provider component
export function Providers({ children }: { children: React.ReactNode }) {
  const [portal, setPortal] = useState<Portal | null>(null);

  useEffect(() => {
    // Validate Portal API key before initialization
    const portalApiKey = process.env.NEXT_PUBLIC_PORTAL_API_KEY;
    const isValidKey = portalApiKey && 
      portalApiKey !== 'your_portal_api_key_from_netlify' && 
      portalApiKey !== 'your_portal_api_key_here' &&
      portalApiKey.length > 10 && 
      !portalApiKey.includes('XXXXXXXXXX');
    
    if (!isValidKey) {
      console.warn('⚠️ Portal SDK disabled in providers: Invalid or placeholder API key detected.');
      return;
    }
    
    try {
      // Initialize Portal only on the client side with valid key
      const instance = new Portal({
        apiKey: portalApiKey,
        autoApprove: true,
        rpcConfig: {
          'eip155:421614': process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
        },
        // The 'host' property should be used for custom subdomains if needed
        // host: 'YOUR-CUSTOM-SUBDOMAIN'
      });
      setPortal(instance);
      console.log('✅ Portal provider initialized successfully');
    } catch (error) {
      console.warn('⚠️ Portal provider initialization failed:', error);
    }
  }, []);

  return (
    <PortalContext.Provider value={{ portal, isReady: !!portal?.ready }}>
      {children}
    </PortalContext.Provider>
  );
}

// Create a custom hook to use the portal context
export const useKustodiaPortal = () => useContext(PortalContext);
