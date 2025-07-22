import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    
    const backendUrl = getBackendUrl();
    const authHeaders = prepareAdminAuthHeaders(request);
    
    const backendResponse = await fetch(`${backendUrl}/api/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Failed to send reply', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin ticket reply route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
