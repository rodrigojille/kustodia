"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Simple auth cache to avoid repeated API calls
let authCache: { isAuthenticated: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 seconds

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const checkingRef = useRef(false);

  const checkAuthentication = async () => {
    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      console.log('[AUTH GUARD] Check already in progress, skipping');
      return;
    }
    
    checkingRef.current = true;
    const now = Date.now();
    
    try {
      // Check cache first
      if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
        console.log('[AUTH GUARD] Using cached auth status:', authCache.isAuthenticated);
        setIsAuthenticated(authCache.isAuthenticated);
        setIsChecking(false);
        
        if (!authCache.isAuthenticated) {
          router.replace("/login");
        }
        return;
      }
      
      // First check localStorage for development mode
      const hasLocalStorageToken = localStorage.getItem('auth_token');
      
      console.log('[AUTH GUARD] Checking authentication:', {
        hasLocalStorageToken: !!hasLocalStorageToken,
        pathname,
        timestamp: new Date().toISOString()
      });
      
      // If we have localStorage token (development), we're authenticated
      if (hasLocalStorageToken) {
        console.log('[AUTH GUARD] Development mode - localStorage token found');
        authCache = { isAuthenticated: true, timestamp: now };
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }
      
      // For production mode, make API call to check authentication status
      // This works because the Next.js proxy will forward HTTP-only cookies
      console.log('[AUTH GUARD] Production mode - checking auth via API call');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include', // Important: include cookies
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('[AUTH GUARD] Authentication valid - user authenticated');
        authCache = { isAuthenticated: true, timestamp: now };
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        console.log('[AUTH GUARD] Authentication failed - redirecting to login:', response.status);
        authCache = { isAuthenticated: false, timestamp: now };
        setIsAuthenticated(false);
        setIsChecking(false);
        // Preserve the current URL for after-login redirect
        const returnTo = pathname ? encodeURIComponent(pathname) : '';
        router.replace(returnTo ? `/login?returnTo=${returnTo}` : '/login');
      }
    } catch (error) {
      console.error('[AUTH GUARD] Error checking authentication:', error);
      
      // If it's an abort error (timeout), don't redirect immediately
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[AUTH GUARD] Request timed out, retrying...');
        // Don't set cache on timeout, allow retry
        setIsChecking(false);
        return;
      }
      
      // On other errors, redirect to login
      authCache = { isAuthenticated: false, timestamp: now };
      setIsAuthenticated(false);
      setIsChecking(false);
      // Preserve the current URL for after-login redirect
      const returnTo = pathname ? encodeURIComponent(pathname) : '';
      router.replace(returnTo ? `/login?returnTo=${returnTo}` : '/login');
    } finally {
      checkingRef.current = false;
    }
  };

  useEffect(() => {
    // Only protect routes other than /login
    if (pathname === "/login") {
      setIsChecking(false);
      setIsAuthenticated(false);
      return;
    }
    
    // If we're already authenticated and just changing routes, don't re-check
    if (isAuthenticated && !isChecking) {
      console.log('[AUTH GUARD] Already authenticated, allowing route change to:', pathname);
      return;
    }
    
    // Delay authentication check to allow pages to extract URL tokens first
    const timeoutId = setTimeout(() => {
      checkAuthentication();
    }, 100); // Reduced delay for faster page transitions

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, router]);

  // Show nothing during the brief check period
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Only show children if authenticated (for non-login pages)
  if (pathname !== "/login" && !isAuthenticated) {
    return null; // Will redirect to login
  }
  
  return <>{children}</>;
}
