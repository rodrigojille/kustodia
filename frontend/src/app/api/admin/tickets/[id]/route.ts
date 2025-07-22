import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const backendUrl = getBackendUrl();
    const authHeaders = prepareAdminAuthHeaders(request);
    
    const backendResponse = await fetch(`${backendUrl}/api/admin/tickets/${ticketId}`, {
      method: 'GET',
      headers: authHeaders,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: 'Ticket not found or access denied', details: errorText }, 
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin ticket details route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
