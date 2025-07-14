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
    const timeoutId = setTimeout(async () => {
      try {
        // First check localStorage for development mode
        const hasLocalStorageToken = localStorage.getItem('auth_token');
        
        console.log('[AUTH GUARD] Checking authentication:', {
          hasLocalStorageToken: !!hasLocalStorageToken,
          pathname
        });
        
        // If we have localStorage token (development), we're authenticated
        if (hasLocalStorageToken) {
          console.log('[AUTH GUARD] Development mode - localStorage token found');
          setIsChecking(false);
          return;
        }
        
        // For production mode, make API call to check authentication status
        // This works because the Next.js proxy will forward HTTP-only cookies
        console.log('[AUTH GUARD] Production mode - checking auth via API call');
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include' // Important: include cookies
        });
        
        if (response.ok) {
          console.log('[AUTH GUARD] Authentication valid - user authenticated');
          setIsChecking(false);
        } else {
          console.log('[AUTH GUARD] Authentication failed - redirecting to login');
          router.replace("/login");
        }
      } catch (error) {
        console.error('[AUTH GUARD] Error checking authentication:', error);
        // On error, redirect to login to be safe
        router.replace("/login");
      }
    }, 200); // Delay to let dashboard extract token from URL

    return () => clearTimeout(timeoutId);
  }, [pathname, router]);

  // Show nothing during the brief check period
  if (isChecking) return null;
  
  return <>{children}</>;
}
