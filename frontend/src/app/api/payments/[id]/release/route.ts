import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const { release_type, reason } = await request.json();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Validate input
    if (!release_type) {
      return NextResponse.json({ 
        error: 'Missing required field: release_type' 
      }, { status: 400 });
    }

    if (!['auto', 'manual', 'dispute'].includes(release_type)) {
      return NextResponse.json({ 
        error: 'release_type must be "auto", "manual", or "dispute"' 
      }, { status: 400 });
    }

    console.log(`Releasing payment ${paymentId}:`, {
      release_type,
      reason,
      timestamp: new Date().toISOString()
    });

    // For auto-release, this would:
    // 1. Verify both payer_approval and payee_approval are true
    // 2. Execute smart contract release function
    // 3. Transfer funds from escrow to recipient
    // 4. Update payment status to 'completed'
    // 5. Send notifications to both parties
    // 6. Log the transaction on blockchain

    // Mock response - replace with actual smart contract interaction
    const mockReleasedPayment = {
      id: paymentId,
      amount: 1000,
      currency: 'MXN',
      description: 'Test payment',
      recipient_email: 'test.seller@kustodia.mx',
      payer_email: 'rodrigojille@gmail.com',
      status: 'completed', // Changed from 'funded' to 'completed'
      payment_type: 'nuevo_flujo',
      vertical_type: 'inmobiliaria',
      release_conditions: 'El pago se liberará cuando el contrato esté firmado...',
      payer_approval: true,
      payee_approval: true,
      payer_approval_timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      payee_approval_timestamp: new Date(Date.now() - 60000).toISOString(),  // 1 minute ago
      release_timestamp: new Date().toISOString(),
      release_type: release_type,
      release_reason: reason,
      transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock tx hash
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true,
      message: 'Payment released successfully',
      payment: mockReleasedPayment,
      transaction: {
        hash: mockReleasedPayment.transaction_hash,
        network: 'polygon',
        explorer_url: `https://polygonscan.com/tx/${mockReleasedPayment.transaction_hash}`
      }
    });

  } catch (error) {
    console.error('Error releasing payment:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
