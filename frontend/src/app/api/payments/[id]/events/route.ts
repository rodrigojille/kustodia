import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const backendRes = await fetch(`http://localhost:4000/payments/${id}/events`);
    const data = await backendRes.json();
    return new NextResponse(JSON.stringify(data), { status: backendRes.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: 'Proxy error', details: String(err) }), { status: 500 });
  }
}
