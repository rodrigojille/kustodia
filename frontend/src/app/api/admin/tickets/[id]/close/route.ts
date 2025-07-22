import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    
    const backendUrl = getBackendUrl();
    const authHeaders = prepareAdminAuthHeaders(request);
    
    const backendResponse = await fetch(`${backendUrl}/api/admin/tickets/${ticketId}/close`, {
      method: 'PATCH',
      headers: authHeaders,
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
