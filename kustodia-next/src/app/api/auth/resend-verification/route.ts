import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Forward the request to the backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/users/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to resend verification' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error resending verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
