import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Prepare authentication headers using the utility
    const authHeaders = prepareAdminAuthHeaders(request);
    const backendUrl = getBackendUrl();

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend with proper authentication
    const backendResponse = await fetch(`${backendUrl}/api/dispute/ai-assessment/batch`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
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
    console.error('Error in AI assessment batch route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
