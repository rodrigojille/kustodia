import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dynamic route to proxy all backend API calls with cookie authentication
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxyRequest(request, params, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxyRequest(request, params, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxyRequest(request, params, 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxyRequest(request, params, 'DELETE');
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxyRequest(request, params, 'PATCH');
}

async function handleProxyRequest(
  request: NextRequest, 
  params: { path: string[] }, 
  method: string
) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('auth_token')?.value;
    
    // Check for localStorage token in custom header (works in all environments)
    const localStorageToken = request.headers.get('x-auth-token');
    
    console.log('[PROXY API] Token sources:', {
      hasCookieToken: !!token,
      hasHeaderToken: !!localStorageToken,
      allCookies: (await cookieStore).getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      requestHeaders: Object.fromEntries(request.headers.entries())
    });
    
    // Prefer localStorage token from header if available (more reliable in development)
    if (localStorageToken) {
      token = localStorageToken;
      console.log('[PROXY API] Using localStorage token from header');
    } else if (token) {
      console.log('[PROXY API] Using token from HTTP-only cookie');
    }
    
    const apiPath = params.path.join('/');
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const fullUrl = `${backendUrl}/api/${apiPath}`;

    console.log('[PROXY API] Request details:', {
      method,
      apiPath,
      fullUrl,
      hasToken: !!token,
      tokenSource: token === localStorageToken ? 'localStorage' : 'cookie',
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      cookieCount: (await cookieStore).getAll().length
    });

    if (!token) {
      console.log('[PROXY API] No auth token found, returning 401');
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Get request body if present
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        // No body or invalid body
      }
    }

    // Forward headers (excluding cookie-related ones)
    const forwardHeaders: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': request.headers.get('content-type') || 'application/json'
    };

    // Forward the request to the backend
    const response = await fetch(fullUrl, {
      method,
      headers: forwardHeaders,
      body: body || undefined
    });

    // Get response data
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Return the response with the same status
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('[PROXY API] Error:', error);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
