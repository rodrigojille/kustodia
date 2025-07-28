// src/app/api/auth/verify-email/route.ts
// Next.js API route to proxy email verification to backend

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/users/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return the backend response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Email verification proxy error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Also handle GET requests for token-based verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/users/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    // Return the backend response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Email verification GET proxy error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
