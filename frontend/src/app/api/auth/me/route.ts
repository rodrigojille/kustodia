import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const allCookies = (await cookieStore).getAll();

    console.log('[AUTH API] /api/auth/me request:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      url: request.url
    });

    if (!token) {
      console.log('[AUTH API] No token found, returning 401');
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Forward the request to the backend /api/users/me endpoint with the token
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AUTH API] Backend /api/users/me failed:', response.status, errorText);
      return NextResponse.json({ error: 'Authentication failed' }, { status: response.status });
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('[AUTH API] Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
