import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the frontend request
    const authHeader = request.headers.get('authorization');
    const customToken = request.headers.get('x-auth-token');
    
    let token: string | null = null;
    
    // Check for Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Check for custom x-auth-token header
    else if (customToken) {
      token = customToken;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    // Get query parameters and forward them
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const baseBackendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const backendUrl = `${baseBackendUrl}/api/admin/system/activity${queryString ? `?${queryString}` : ''}`;

    // Forward the request to the backend
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Backend service unavailable', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
