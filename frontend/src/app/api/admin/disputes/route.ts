import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Change this URL to your backend disputes endpoint
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const DISPUTES_ENDPOINT = `${BACKEND_URL}/api/admin/disputes`;

export async function GET(req: Request) {
  try {
    // Get the authorization header from the frontend request
    const authHeader = req.headers.get('authorization');
    const customToken = req.headers.get('x-auth-token');
    
    let token: string | null = null;
    
    // Check for Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Check for custom x-auth-token header
    else if (customToken) {
      token = customToken;
    }
    
    // Token is optional since we now support both localStorage and cookie auth
    // The backend will handle authentication validation

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add token if available (localStorage auth)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Forward cookies from client to backend (HTTP-only cookie auth)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    const res = await fetch(DISPUTES_ENDPOINT, {
      headers,
      // credentials: 'include', // Uncomment if you need to send cookies
    });
    if (!res.ok) {
      return NextResponse.json({ disputes: [], error: "Failed to fetch disputes" }, { status: res.status });
    }
    const data = await res.json();
    // Ensure the response is in the expected format
    return NextResponse.json({ disputes: data.disputes || data || [] });
  } catch (error) {
    return NextResponse.json({ disputes: [], error: (error as Error).message }, { status: 500 });
  }
}
