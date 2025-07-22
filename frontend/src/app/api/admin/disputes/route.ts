import { NextRequest, NextResponse } from 'next/server';
import { makeAdminRequest } from '../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await makeAdminRequest('disputes', request, {
      method: 'GET',
    });
    if (!backendResponse.ok) {
      return NextResponse.json({ disputes: [], error: "Failed to fetch disputes" }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    // Ensure the response is in the expected format
    return NextResponse.json({ disputes: data.disputes || data || [] });
  } catch (error) {
    return NextResponse.json({ disputes: [], error: (error as Error).message }, { status: 500 });
  }
}
