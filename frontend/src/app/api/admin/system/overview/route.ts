import { NextRequest, NextResponse } from 'next/server';
import { makeAdminRequest } from '../../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const backendResponse = await makeAdminRequest('system/overview', request, {
      method: 'GET',
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
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
