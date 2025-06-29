import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { wallet_address } = await req.json();
  if (!wallet_address) {
    return NextResponse.json({ error: 'Falta dirección de wallet' }, { status: 400 });
  }
  // Forward to backend
  const backendRes = await fetch('http://localhost:4000/api/users/update-wallet-address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: JSON.stringify({ wallet_address }),
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
