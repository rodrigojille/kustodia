import { NextRequest, NextResponse } from 'next/server';

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
    
    // Get the authorization header from the frontend request
    const authHeader = request.headers.get('authorization');
    const customToken = request.headers.get('x-auth-token');
    
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    let backendUrl;
    if (isProduction) {
      // Use Heroku logs API in production
      backendUrl = `${process.env.BACKEND_URL || 'https://kustodia-backend-39ad4d1c3a78.herokuapp.com'}/api/admin/heroku-logs?lines=${lines}&level=${level}`;
    } else {
      // Use local system logs in development
      backendUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/admin/system/logs?limit=${lines}&level=${level}`;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
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
