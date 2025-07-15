import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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

    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    // Prepare headers for backend request
    const backendHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add token if available (localStorage auth)
    if (token) {
      backendHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Forward cookies from client to backend (HTTP-only cookie auth)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      backendHeaders['Cookie'] = cookieHeader;
    }
    
    // Close ticket via admin
    const backendResponse = await fetch(`${backendUrl}/api/admin/tickets/${id}/close`, {
      method: 'PATCH',
      headers: backendHeaders,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to close ticket', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin ticket close route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
