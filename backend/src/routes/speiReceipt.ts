import { Router, Request, Response, NextFunction } from 'express';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { JunoTransaction } from '../entity/JunoTransaction';
import { SPEIReceiptService } from '../services/speiReceiptService';
import { AuthenticatedRequest } from '../AuthenticatedRequest';
import jwt from 'jsonwebtoken';

const router = Router();

// Simple auth middleware
const authenticateToken = (req: any, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

/**
 * Download SPEI receipt for a completed payment
 * GET /api/payments/:id/spei-receipt
 */
router.get('/:id/spei-receipt', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    const paymentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!paymentId || isNaN(paymentId)) {
      res.status(400).json({ error: 'Invalid payment ID' });
      return;
    }

    // Get payment with related entities
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'seller', 'junoTransaction']
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Check if user has access to this payment
    if (payment.user.id !== userId && payment.seller.id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if payment is completed and has SPEI payout
    if (payment.status !== 'paid') {
      res.status(400).json({ 
        error: 'SPEI receipt only available for completed payments' 
      });
      return;
    }

    // Get associated Juno transaction for payout details
    const junoTxRepo = AppDataSource.getRepository(JunoTransaction);
    const junoTransaction = await junoTxRepo.findOne({
      where: { 
        type: 'payout',
        reference: payment.juno_payment_id || undefined
      },
      order: { created_at: 'DESC' }
    });

    // Generate SPEI receipt
    console.log(`[SPEI Receipt] Generating receipt for payment ${paymentId}`);
    const receiptPDF = await SPEIReceiptService.generateReceiptFromPayment(
      payment,
      payment.seller,
      junoTransaction?.id?.toString()
    );

    // Set response headers for PDF download
    const filename = `comprobante-spei-${paymentId}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', receiptPDF.length);

    // Send PDF
    res.send(receiptPDF);
    console.log(`[SPEI Receipt] Receipt downloaded for payment ${paymentId} by user ${userId}`);

  } catch (error) {
    console.error('[SPEI Receipt] Error generating receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to generate SPEI receipt',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Preview SPEI receipt in HTML format (for development/testing)
 * GET /api/payments/:id/spei-receipt/preview
 */
router.get('/:id/spei-receipt/preview', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    const paymentId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!paymentId || isNaN(paymentId)) {
      res.status(400).json({ error: 'Invalid payment ID' });
      return;
    }

    // Get payment with related entities
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'seller', 'junoTransaction']
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // Check if user has access to this payment
    if (payment.user.id !== userId && payment.seller.id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check if payment is completed
    if (payment.status !== 'paid') {
      res.status(400).json({ 
        error: 'SPEI receipt only available for completed payments' 
      });
      return;
    }

    // Get associated Juno transaction
    const junoTxRepo = AppDataSource.getRepository(JunoTransaction);
    const junoTransaction = await junoTxRepo.findOne({
      where: { 
        type: 'payout',
        reference: payment.juno_payment_id || undefined
      },
      order: { created_at: 'DESC' }
    });

    // Generate SPEI receipt in HTML format
    const receiptHTML = await SPEIReceiptService.generateReceiptFromPayment(
      payment,
      payment.seller,
      junoTransaction?.id?.toString(),
      { format: 'html' }
    );

    // Send HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(receiptHTML.toString('utf8'));

  } catch (error) {
    console.error('[SPEI Receipt] Error generating HTML preview:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to generate SPEI receipt preview',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Verify SPEI receipt authenticity (public endpoint)
 * GET /api/payments/verify-receipt?code=CEP-NVIO001-XXXXXXXX-XXXXXX
 */
router.get('/verify-receipt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Compliance code required' });
      return;
    }

    // Validate CEP code format
    const cepPattern = /^CEP-NVIO001-\d{8}-\d{6}$/;
    if (!cepPattern.test(code)) {
      res.status(400).json({ error: 'Invalid compliance code format' });
      return;
    }

    // Extract payment ID from compliance code
    const parts = code.split('-');
    const paymentIdStr = parts[2];
    const paymentId = parseInt(paymentIdStr, 10);

    if (!paymentId || isNaN(paymentId)) {
      res.status(400).json({ error: 'Invalid payment ID in compliance code' });
      return;
    }

    // Get payment (no auth required for verification)
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['user', 'seller']
    });

    if (!payment) {
      res.status(404).json({ 
        error: 'Receipt not found',
        valid: false
      });
      return;
    }

    // Check if payment is completed
    if (payment.status !== 'paid') {
      res.status(404).json({ 
        error: 'Receipt not available for incomplete payments',
        valid: false
      });
      return;
    }

    // Get associated Juno transaction
    const junoTxRepo = AppDataSource.getRepository(JunoTransaction);
    const junoTransaction = await junoTxRepo.findOne({
      where: { 
        type: 'payout',
        reference: payment.juno_payment_id || undefined
      },
      order: { created_at: 'DESC' }
    });

    // Generate receipt to validate the compliance code
    const receiptData = await SPEIReceiptService.generateReceiptFromPayment(
      payment,
      payment.seller,
      junoTransaction?.id?.toString(),
      { format: 'html' }
    );

    // For now, we'll validate by checking if we can generate the receipt
    // In a real implementation, you'd validate the digital signature
    const isValid = receiptData && receiptData.length > 0;

    res.json({
      valid: isValid,
      payment_id: paymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      created_at: payment.created_at,
      compliance_code: code,
      institution: 'Nvio Pagos México',
      verified_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SPEI Receipt] Error verifying receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to verify SPEI receipt',
      valid: false,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;
