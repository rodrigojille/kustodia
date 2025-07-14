/**
 * Authenticated fetch utility that uses direct backend calls with proper CORS and localStorage token
 */

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export async function authFetch(endpoint: string, options: FetchOptions = {}) {
  // Clean endpoint: remove leading slash and 'api/' prefix
  let cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  cleanEndpoint = cleanEndpoint.replace(/^api\//, ''); // Remove 'api/' prefix
  
  console.log('[AUTH FETCH DEBUG] Original endpoint:', endpoint);
  console.log('[AUTH FETCH DEBUG] Cleaned endpoint:', cleanEndpoint);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Always check for localStorage token in browser environment
  const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Send localStorage token via x-auth-token header (for proxy route)
  if (localStorageToken) {
    headers['x-auth-token'] = localStorageToken;
    console.log('[AUTH FETCH] Adding localStorage token to x-auth-token header');
  } else {
    console.log('[AUTH FETCH] No localStorage token found');
  }

  // Use Next.js proxy route for all requests
  const proxyUrl = `/api/${cleanEndpoint}`;
  console.log('[AUTH FETCH] Using Next.js proxy URL:', proxyUrl);
  
  try {
    const response = await fetch(proxyUrl, {
      ...options,
      headers,
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    console.log('[AUTH FETCH] Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    return response;
  } catch (error) {
    console.error('[AUTH FETCH] Error:', error);
    throw error;
  }
}

export default authFetch;
