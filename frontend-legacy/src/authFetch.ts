// A wrapper for fetch that automatically adds the Authorization header if a JWT token exists in localStorage
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  let initHeaders: Record<string, string> = {};
  if (init.headers instanceof Headers) {
    init.headers.forEach((value, key) => { initHeaders[key] = value; });
  } else if (Array.isArray(init.headers)) {
    init.headers.forEach(([key, value]) => { initHeaders[key] = value; });
  } else if (typeof init.headers === 'object' && init.headers !== null) {
    initHeaders = { ...init.headers as Record<string, string> };
  }
  const headers = { ...initHeaders, ...authHeader };
  return fetch(input, { ...init, headers });
}
