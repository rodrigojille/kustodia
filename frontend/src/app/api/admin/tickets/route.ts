import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use the correct backend endpoint
    const backendUrl = getBackendUrl();
    const authHeaders = prepareAdminAuthHeaders(request);
    
    // Try the admin tickets endpoint first
    const backendResponse = await fetch(`${backendUrl}/api/admin/tickets`, {
      method: 'GET',
      headers: authHeaders,
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
    console.error('Error in admin tickets route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
