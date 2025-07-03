'use client';

import { useEffect } from 'react';

// Define the Crisp window object type to avoid TypeScript errors
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const CrispChat = () => {
  useEffect(() => {
    // The script is simple and doesn't need complex checks.
    // We just set the global variables and append the script.
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "dbfb4659-1546-46ae-b003-d86e1ab6dcf6";

    const d = document;
    const s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    d.getElementsByTagName("head")[0].appendChild(s);

  }, []);

  return null; // This component doesn't render anything itself
};

export default CrispChat;
