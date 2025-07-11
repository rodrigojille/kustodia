export const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4000' 
  : process.env.NEXT_PUBLIC_API_BASE || 'https://kustodia-backend-f991a7cb1824.herokuapp.com';

const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // For HTTP-only cookie authentication, we proxy requests through Next.js API routes
  // that can access cookies server-side
  const headers = new Headers(options.headers || {});
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Use Next.js API proxy route that handles cookie authentication
  const proxyUrl = `/api/proxy${url}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers,
    credentials: 'include', // Include cookies in request
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      // Clear any localStorage data and redirect to login
      localStorage.removeItem('userEmail');
      window.location.href = '/login?session_expired=true';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export default authFetch;
