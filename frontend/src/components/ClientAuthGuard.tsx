"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only protect routes other than /login
    if (pathname === "/login") {
      setIsChecking(false);
      return;
    }
    
    // Delay authentication check to allow pages to extract URL tokens first
    const timeoutId = setTimeout(() => {
      // Check both cookie (production) and localStorage (development)
      const hasCookieToken = document.cookie.includes("auth_token=");
      const hasLocalStorageToken = localStorage.getItem('auth_token');
      
      console.log('[AUTH GUARD] Checking authentication:', {
        hasCookieToken,
        hasLocalStorageToken: !!hasLocalStorageToken,
        pathname
      });
      
      if (!hasCookieToken && !hasLocalStorageToken) {
        console.log('[AUTH GUARD] No session found, redirecting to login');
        router.replace("/login");
      }
      setIsChecking(false);
    }, 200); // Increased delay to let dashboard extract token from URL

    return () => clearTimeout(timeoutId);
  }, [pathname, router]);

  // Show nothing during the brief check period
  if (isChecking) return null;
  
  return <>{children}</>;
}
