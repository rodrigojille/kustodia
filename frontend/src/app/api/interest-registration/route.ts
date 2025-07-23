import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      phone,
      source,
      vertical,
      timestamp,
      userAgent,
      referrer
    } = body;

    // Validate required fields
    if (!name || !email || !source || !vertical) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Prepare data for storage
    const interestData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      source,
      vertical,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      referrer: referrer || null,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store in database via backend API
    try {
      const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${backendApiUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: interestData.name,
          email: interestData.email,
          message: `Interest from ${interestData.source} - ${interestData.vertical}`,
          empresa: interestData.company,
          telefono: interestData.phone,
          vertical: interestData.vertical
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const backendResult = await response.json();
      console.log('Lead stored successfully:', backendResult);
    } catch (backendError) {
      console.error('Backend storage error:', backendError);
      // Log the data locally as fallback
      console.log('Interest Registration (fallback):', JSON.stringify(interestData, null, 2));
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Interest registered successfully',
      data: {
        id: `interest_${Date.now()}`, // Temporary ID
        email: interestData.email,
        source: interestData.source,
        vertical: interestData.vertical
      }
    });

  } catch (error) {
    console.error('Interest registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve interest registrations (admin only)
export async function GET(request: NextRequest) {
  // TODO: Add authentication check for admin users
  
  try {
    // TODO: Retrieve from database
    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Interest registrations retrieved'
    });
  } catch (error) {
    console.error('Error retrieving interest registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
