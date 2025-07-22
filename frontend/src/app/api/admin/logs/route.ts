import { NextRequest, NextResponse } from 'next/server';
import { prepareAdminAuthHeaders, getBackendUrl } from '../../../../utils/adminAuthHeaders';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environment = searchParams.get('environment') || 'auto';
    const lines = searchParams.get('lines') || '100';
    const level = searchParams.get('level') || 'info';
    
    // Detect environment if auto
    const isProduction = environment === 'production' || 
      (environment === 'auto' && (
        process.env.NODE_ENV === 'production' ||
        request.headers.get('host')?.includes('kustodia.mx')
      ));
    
    // Prepare authentication headers using the utility
    const authHeaders = prepareAdminAuthHeaders(request);

    const baseBackendUrl = getBackendUrl();
    let backendUrl;
    if (isProduction) {
      // Use simple logs API in production (database-based logs)
      backendUrl = `${baseBackendUrl}/api/admin/logs?lines=${lines}&level=${level}`;
    } else {
      // Use local system logs in development
      backendUrl = `${baseBackendUrl}/api/admin/system-logs/logs?limit=${lines}&level=${level}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: authHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Backend service unavailable', details: errorText }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Normalize response format
    const normalizedResponse = {
      logs: data.logs || [],
      environment: isProduction ? 'production' : 'local',
      source: isProduction ? 'heroku' : 'database',
      totalLines: data.totalLines || data.logs?.length || 0,
      filteredLines: data.filteredLines || data.logs?.length || 0,
      timestamp: new Date().toISOString(),
      ...(data.message && { message: data.message }),
      ...(data.configurationRequired && { configurationRequired: data.configurationRequired })
    };

    return NextResponse.json(normalizedResponse);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        logs: [],
        environment: 'unknown',
        source: 'error'
      }, 
      { status: 500 }
    );
  }
}
