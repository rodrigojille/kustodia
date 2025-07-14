import { NextResponse } from "next/server";

// Change this URL to your backend disputes endpoint
const BACKEND_URL = process.env.DISPUTES_API_URL || "http://localhost:4000/api/admin/disputes";

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
    
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
    const res = await fetch(BACKEND_URL, {
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
