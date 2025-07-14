import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering for this route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies from the request to forward to backend
    const cookies = request.headers.get('cookie') || '';
    
    // Also extract token from headers as fallback (for development)
    const authHeader = request.headers.get('authorization');
    const customToken = request.headers.get('x-auth-token');
    
    // Forward the request to the backend with cookies
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookies, // Forward all cookies including HTTP-only ones
    };
    
    // Add Authorization header if available (for development mode)
    if (authHeader?.startsWith('Bearer ')) {
      headers['Authorization'] = authHeader;
    } else if (customToken) {
      headers['x-auth-token'] = customToken;
    }
    
    console.log('[PROXY] /api/users/me - Forwarding request with cookies:', {
      hasCookies: !!cookies,
      cookieLength: cookies.length,
      hasAuthHeader: !!authHeader,
      backendUrl: `${apiUrl}/api/users/me`
    });
    
    const response = await fetch(`${apiUrl}/api/users/me`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to fetch user data' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
