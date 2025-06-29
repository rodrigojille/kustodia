import { NextResponse } from "next/server";

// Change this URL to your backend disputes endpoint
const BACKEND_URL = process.env.DISPUTES_API_URL || "http://localhost:4000/api/admin/disputes";

export async function GET(req: Request) {
  try {
    // Forward Authorization header if present
    const auth = req.headers.get('authorization');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth) headers["Authorization"] = auth;
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
