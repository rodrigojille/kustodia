/**
 * Utility for preparing authentication headers for admin API routes
 * Supports both localStorage tokens and HTTP-only cookies
 * Handles both production and local environments
 */

export function prepareAdminAuthHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get potential authentication sources
  const authHeader = request.headers.get('authorization');
  const customToken = request.headers.get('x-auth-token');
  const cookieHeader = request.headers.get('cookie');

  // Forward Authorization header if present
  if (authHeader) {
    headers['Authorization'] = authHeader;
    console.log('[ADMIN AUTH] Using Authorization header');
  }

  // Forward custom token header if present (from localStorage)
  if (customToken) {
    headers['x-auth-token'] = customToken;
    console.log('[ADMIN AUTH] Using x-auth-token header');
  }

  // Forward cookies for HTTP-only cookie authentication
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
    console.log('[ADMIN AUTH] Forwarding cookies for HTTP-only auth');
  }

  // Log authentication method being used
  if (!authHeader && !customToken && !cookieHeader) {
    console.warn('[ADMIN AUTH] No authentication headers found');
  }

  return headers;
}

/**
 * Get the appropriate backend URL based on environment
 */
export function getBackendUrl(): string {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    return process.env.BACKEND_URL || 'https://kustodia-backend-39ad4d1c3a78.herokuapp.com';
  } else {
    return process.env.BACKEND_URL || 'http://localhost:4000';
  }
}

/**
 * Make an authenticated request to the backend admin API
 */
export async function makeAdminRequest(
  endpoint: string, 
  request: Request, 
  options: RequestInit = {}
): Promise<Response> {
  const backendUrl = getBackendUrl();
  
  // Handle query parameters from the original request
  const url = new URL(request.url);
  const queryString = url.searchParams.toString();
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const fullUrl = `${backendUrl}/api/admin/${cleanEndpoint}${queryString ? `?${queryString}` : ''}`;
  
  const authHeaders = prepareAdminAuthHeaders(request);
  
  console.log('[ADMIN REQUEST] Making request to:', fullUrl);
  console.log('[ADMIN REQUEST] Environment:', process.env.NODE_ENV);
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
}
