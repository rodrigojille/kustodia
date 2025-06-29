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
    const { approval_type, approved, user_email } = await request.json();

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
    if (!approval_type || typeof approved !== 'boolean' || !user_email) {
      return NextResponse.json({ 
        error: 'Missing required fields: approval_type, approved, user_email' 
      }, { status: 400 });
    }

    if (!['payer', 'payee'].includes(approval_type)) {
      return NextResponse.json({ 
        error: 'approval_type must be either "payer" or "payee"' 
      }, { status: 400 });
    }

    // For now, we'll simulate the database update
    // In a real implementation, you would:
    // 1. Fetch the payment from database
    // 2. Verify the user has permission to approve (is payer/payee)
    // 3. Update the approval status and timestamp
    // 4. Return the updated payment

    console.log(`Updating payment ${paymentId} approval:`, {
      approval_type,
      approved,
      user_email,
      timestamp: new Date().toISOString()
    });

    // Mock response - replace with actual database update
    const mockUpdatedPayment = {
      id: paymentId,
      amount: 1000,
      currency: 'MXN',
      description: 'Test payment',
      recipient_email: 'test.seller@kustodia.mx',
      payer_email: 'rodrigojille@gmail.com',
      status: 'funded',
      payment_type: 'nuevo_flujo',
      vertical_type: 'inmobiliaria',
      release_conditions: 'El pago se liberará cuando el contrato esté firmado...',
      payer_approval: approval_type === 'payer' ? approved : false,
      payee_approval: approval_type === 'payee' ? approved : false,
      payer_approval_timestamp: approval_type === 'payer' && approved ? new Date().toISOString() : null,
      payee_approval_timestamp: approval_type === 'payee' && approved ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true,
      payment: mockUpdatedPayment 
    });

  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
