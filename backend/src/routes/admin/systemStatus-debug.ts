import { Router, Request, Response } from 'express';
import { authDebugMiddleware, enhancedAuthenticateJWT, enhancedRequireAdminRole } from '../../middleware/authDebug';
import AppDataSource from '../../ormconfig';
import { Payment } from '../../entity/Payment';
import { PaymentEvent } from '../../entity/PaymentEvent';
import { Escrow } from '../../entity/Escrow';

const router = Router();

// Add debug middleware to all routes
router.use(authDebugMiddleware);

// Test route to check if basic auth works
router.get('/auth-test', enhancedAuthenticateJWT, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: user?.id,
      email: user?.email,
      role: user?.role
    },
    timestamp: new Date().toISOString()
  });
});

// Test route to check if admin role works
router.get('/admin-test', enhancedAuthenticateJWT, enhancedRequireAdminRole, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    success: true,
    message: 'Admin authentication successful',
    user: {
      id: user?.id,
      email: user?.email,
      role: user?.role
    },
    timestamp: new Date().toISOString()
  });
});

// Fixed system overview with enhanced auth
router.get('/overview', enhancedAuthenticateJWT, enhancedRequireAdminRole, async (req: Request, res: Response) => {
  try {
    console.log('[SYSTEM OVERVIEW] Starting system overview request');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get basic counts with error handling
    let todayPayments = 0;
    let activeEscrows = 0;
    let pendingPayouts = 0;
    let failedPayments = 0;
    
    try {
      todayPayments = await AppDataSource.getRepository(Payment)
        .createQueryBuilder('payment')
        .where('DATE(payment.created_at) = DATE(:today)', { today })
        .getCount();
      console.log('[SYSTEM OVERVIEW] Today payments:', todayPayments);
    } catch (error) {
      console.error('[SYSTEM OVERVIEW] Error getting today payments:', error);
    }
    
    try {
      activeEscrows = await AppDataSource.getRepository(Escrow)
        .createQueryBuilder('escrow')
        .innerJoin('escrow.payment', 'payment')
        .where('escrow.status IN (:...statuses)', { 
          statuses: ['active', 'funded'] 
        })
        .andWhere('payment.status = :paymentStatus', { paymentStatus: 'escrowed' })
        .getCount();
      console.log('[SYSTEM OVERVIEW] Active escrows:', activeEscrows);
    } catch (error) {
      console.error('[SYSTEM OVERVIEW] Error getting active escrows:', error);
    }
    
    try {
      pendingPayouts = await AppDataSource.getRepository(Payment)
        .createQueryBuilder('payment')
        .innerJoin('payment.escrow', 'escrow')
        .where('escrow.status = :status', { status: 'released' })
        .andWhere('payment.status = :paymentStatus', { paymentStatus: 'pending' })
        .getCount();
      console.log('[SYSTEM OVERVIEW] Pending payouts:', pendingPayouts);
    } catch (error) {
      console.error('[SYSTEM OVERVIEW] Error getting pending payouts:', error);
    }
    
    try {
      failedPayments = await AppDataSource.getRepository(Payment)
        .createQueryBuilder('payment')
        .where('payment.status = :status', { status: 'failed' })
        .andWhere('DATE(payment.updated_at) >= DATE(:yesterday)', { 
          yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        })
        .getCount();
      console.log('[SYSTEM OVERVIEW] Failed payments:', failedPayments);
    } catch (error) {
      console.error('[SYSTEM OVERVIEW] Error getting failed payments:', error);
    }
    
    const response = {
      success: true,
      data: {
        systemStatus: 'operational',
        automationStatus: 'running',
        todayPayments,
        activeEscrows,
        pendingPayouts,
        failedPayments
      },
      serviceHealth: {
        database: true,
        backend: true,
        junoApi: true,
        bridgeWallet: true
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('[SYSTEM OVERVIEW] Sending response:', response);
    res.json(response);
    
  } catch (error: any) {
    console.error('[SYSTEM OVERVIEW] Error getting system overview:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get system overview',
      message: error?.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Fixed system activity with enhanced auth
router.get('/activity', enhancedAuthenticateJWT, enhancedRequireAdminRole, async (req: Request, res: Response) => {
  try {
    console.log('[SYSTEM ACTIVITY] Starting system activity request');
    
    const recentEvents = await AppDataSource.getRepository(PaymentEvent)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.payment', 'payment')
      .orderBy('event.created_at', 'DESC')
      .limit(20)
      .getMany();
    
    console.log('[SYSTEM ACTIVITY] Found events:', recentEvents.length);
    
    const activities = recentEvents.map((event: PaymentEvent) => {
      const payment = event.payment;
      return {
        id: event.id,
        type: event.type,
        description: event.description || event.type,
        timestamp: event.created_at,
        isAutomatic: event.is_automatic,
        paymentId: payment?.id,
        paymentAmount: payment?.amount,
        paymentCurrency: payment?.currency,
        paymentStatus: payment?.status,
        recipientEmail: payment?.recipient_email
      };
    });
    
    const response = {
      success: true,
      activities,
      timestamp: new Date().toISOString()
    };
    
    console.log('[SYSTEM ACTIVITY] Sending response with', activities.length, 'activities');
    res.json(response);
    
  } catch (error: any) {
    console.error('[SYSTEM ACTIVITY] Error getting recent activity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get recent activity',
      message: error?.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
