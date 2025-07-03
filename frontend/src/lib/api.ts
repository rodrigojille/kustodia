export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kustodia-backend-f991a7cb1824.herokuapp.com';

const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/login?session_expired=true';
    }
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export default authFetch;
