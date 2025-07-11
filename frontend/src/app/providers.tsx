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
    // Initialize Portal only on the client side
    const instance = new Portal({
      apiKey: process.env.NEXT_PUBLIC_PORTAL_API_KEY || '',
      autoApprove: true,
      rpcConfig: {
        'eip155:421614': process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      },
      // The 'host' property should be used for custom subdomains if needed
      // host: 'YOUR-CUSTOM-SUBDOMAIN'
    });
    setPortal(instance);
  }, []);

  return (
    <PortalContext.Provider value={{ portal, isReady: !!portal?.ready }}>
      {children}
    </PortalContext.Provider>
  );
}

// Create a custom hook to use the portal context
export const useKustodiaPortal = () => useContext(PortalContext);
