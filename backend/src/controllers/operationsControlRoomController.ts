import { Request, Response } from 'express';
import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { EscrowSafetyService } from '../services/EscrowSafetyService';
import { PaymentAutomationService } from '../services/PaymentAutomationService';
import { sendEmail } from '../utils/emailService';

/**
 * Operations Control Room Controller
 * Provides manual intervention capabilities for failed payment operations
 */

interface FailedOperation {
  id: string;
  type: 'bridge_transfer' | 'escrow_creation' | 'escrow_release' | 'mxnb_redemption';
  paymentId: number;
  status: string;
  error?: string;
  lastAttempt?: Date;
  retryCount: number;
  canRetry: boolean;
  canRollback: boolean;
  details: any;
}

interface ControlRoomStats {
  totalFailedOperations: number;
  pendingRetries: number;
  manualInterventionRequired: number;
  successfulRecoveries: number;
  rollbacksInitiated: number;
}

/**
 * Get dashboard overview of all failed operations
 */
export const getControlRoomDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);

    const failedOperations: FailedOperation[] = [];
    
    // 1. ESCROW CREATION FAILURES - Critical Priority
    // Find payments with bridge transfers but failed escrow creation
    const fundedPayments = await paymentRepo.find({
      where: { status: 'funded' },
      relations: ['escrow']
    });

    for (const payment of fundedPayments) {
      if (payment.escrow && !payment.escrow.smart_contract_escrow_id) {
        // Get error events
        const errorEvents = await eventRepo.find({
          where: { 
            paymentId: payment.id,
            type: 'automation_error'
          },
          order: { created_at: 'DESC' },
          take: 1
        });

        const lastError = errorEvents[0];
        const retryEvents = await eventRepo.count({
          where: { 
            paymentId: payment.id,
            type: 'escrow_recovery_failed'
          }
        });

        failedOperations.push({
          id: `escrow_${payment.id}`,
          type: 'escrow_creation',
          paymentId: payment.id,
          status: retryEvents >= 3 ? 'max_retries_reached' : 'pending_retry',
          error: lastError?.description || 'Escrow creation failed after bridge transfer',
          lastAttempt: lastError?.created_at,
          retryCount: retryEvents,
          canRetry: retryEvents < 3,
          canRollback: true,
          details: {
            amount: payment.amount,
            currency: payment.currency,
            payerEmail: payment.payer_email,
            recipientEmail: payment.recipient_email,
            custodyAmount: payment.escrow.custody_amount,
            bridgeTransferCompleted: true,
            escrowId: payment.escrow.id
          }
        });
      }
    }

    // 2. ESCROW RELEASE FAILURES
    const activeEscrows = await escrowRepo.find({
      where: { status: 'active' },
      relations: ['payment']
    });

    const now = new Date();
    for (const escrow of activeEscrows) {
      if (escrow.custody_end && escrow.custody_end < now) {
        const releaseEvents = await eventRepo.find({
          where: { 
            paymentId: escrow.payment.id,
            type: 'escrow_release_failed'
          },
          order: { created_at: 'DESC' },
          take: 1
        });

        if (releaseEvents.length > 0) {
          const lastError = releaseEvents[0];
          const retryCount = await eventRepo.count({
            where: { 
              paymentId: escrow.payment.id,
              type: 'escrow_release_failed'
            }
          });

          failedOperations.push({
            id: `release_${escrow.payment.id}`,
            type: 'escrow_release',
            paymentId: escrow.payment.id,
            status: retryCount >= 3 ? 'max_retries_reached' : 'pending_retry',
            error: lastError.description || 'Escrow release failed',
            lastAttempt: lastError.created_at,
            retryCount,
            canRetry: retryCount < 3,
            canRollback: false,
            details: {
              escrowId: escrow.smart_contract_escrow_id,
              amount: escrow.release_amount,
              custodyEndDate: escrow.custody_end,
              overdueDays: Math.floor((now.getTime() - escrow.custody_end.getTime()) / (1000 * 60 * 60 * 24))
            }
          });
        }
      }
    }

    // Calculate stats
    const stats: ControlRoomStats = {
      totalFailedOperations: failedOperations.length,
      pendingRetries: failedOperations.filter(op => op.status === 'pending_retry').length,
      manualInterventionRequired: failedOperations.filter(op => op.status === 'max_retries_reached').length,
      successfulRecoveries: await eventRepo.count({
        where: { type: 'escrow_recovery_success' }
      }),
      rollbacksInitiated: await eventRepo.count({
        where: { type: 'rollback_initiated' }
      })
    };

    res.json({
      success: true,
      stats,
      failedOperations: failedOperations.sort((a, b) => {
        // Priority: escrow_creation > escrow_release > others
        const priorityOrder = { 'escrow_creation': 1, 'escrow_release': 2, 'bridge_transfer': 3, 'mxnb_redemption': 4 };
        return priorityOrder[a.type] - priorityOrder[b.type];
      })
    });

  } catch (error: any) {
    console.error('❌ Control Room Dashboard Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manually trigger escrow recovery for a specific payment
 */
export const manualEscrowRecovery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const paymentIdNum = parseInt(paymentId);

    if (!paymentIdNum) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment ID'
      });
      return;
    }

    console.log(`🔧 Manual escrow recovery initiated for Payment ${paymentIdNum}`);

    // Validate prerequisites
    const validation = await EscrowSafetyService.validateEscrowPrerequisites(paymentIdNum);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        validationErrors: validation.errors
      });
      return;
    }

    // Attempt recovery
    const result = await EscrowSafetyService.recoverStuckEscrow(paymentIdNum);

    // Log manual intervention
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const manualEvent = new PaymentEvent();
    manualEvent.paymentId = paymentIdNum;
    manualEvent.type = 'manual_intervention';
    manualEvent.description = JSON.stringify({
      action: 'escrow_recovery',
      result: result.success ? 'success' : 'failed',
      error: result.error,
      timestamp: new Date().toISOString()
    });
    manualEvent.is_automatic = false;
    await eventRepo.save(manualEvent);

    if (result.success) {
      // Send success notification
      await sendEmail({
        to: 'admin@kustodia.mx',
        subject: '✅ Manual Escrow Recovery Successful',
        html: `
          <div style="font-family:Arial,sans-serif;color:#4caf50;">
            <h2>✅ Manual Escrow Recovery Successful</h2>
            <p><strong>Payment ID:</strong> ${paymentIdNum}</p>
            <p><strong>Escrow ID:</strong> ${result.escrowId}</p>
            <p><strong>Transaction Hash:</strong> ${result.transactionHash}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      });
    }

    res.json({
      success: result.success,
      result,
      message: result.success 
        ? 'Escrow recovery completed successfully' 
        : `Recovery failed: ${result.error}`
    });

  } catch (error: any) {
    console.error('❌ Manual Recovery Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Manually trigger rollback for a specific payment
 */
export const manualRollback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const paymentIdNum = parseInt(paymentId);

    if (!paymentIdNum) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment ID'
      });
      return;
    }

    console.log(`🔧 Manual rollback initiated for Payment ${paymentIdNum}`);

    // Verify payment exists and is in correct state
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: paymentIdNum },
      relations: ['escrow']
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
      return;
    }

    if (payment.status !== 'funded') {
      res.status(400).json({
        success: false,
        error: `Payment status is '${payment.status}', rollback only allowed for 'funded' payments`
      });
    }

    // Initiate rollback
    const result = await EscrowSafetyService.initiateRollback(paymentIdNum);

    // Log manual intervention
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const manualEvent = new PaymentEvent();
    manualEvent.paymentId = paymentIdNum;
    manualEvent.type = 'manual_intervention';
    manualEvent.description = JSON.stringify({
      action: 'rollback_initiated',
      reason: reason || 'Manual intervention requested',
      result: result.success ? 'success' : 'failed',
      error: result.error,
      timestamp: new Date().toISOString()
    });
    manualEvent.is_automatic = false;
    await eventRepo.save(manualEvent);

    res.json({
      success: result.success,
      result,
      message: result.success 
        ? 'Rollback initiated successfully - Manual intervention required' 
        : `Rollback failed: ${result.error}`
    });

  } catch (error: any) {
    console.error('❌ Manual Rollback Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get detailed information about a specific failed operation
 */
export const getOperationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const paymentIdNum = parseInt(paymentId);

    if (!paymentIdNum) {
      res.status(400).json({
        success: false,
        error: 'Invalid payment ID'
      });
      return;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const eventRepo = AppDataSource.getRepository(PaymentEvent);

    // Get payment with relations
    const payment = await paymentRepo.findOne({
      where: { id: paymentIdNum },
      relations: ['escrow', 'user', 'seller']
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
      return;
    }

    // Get all events for this payment
    const events = await eventRepo.find({
      where: { paymentId: paymentIdNum },
      order: { created_at: 'DESC' }
    });

    // Get validation status
    const validation = await EscrowSafetyService.validateEscrowPrerequisites(paymentIdNum);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        payerEmail: payment.payer_email,
        recipientEmail: payment.recipient_email,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      },
      escrow: payment.escrow ? {
        id: payment.escrow.id,
        smartContractEscrowId: payment.escrow.smart_contract_escrow_id,
        blockchainTxHash: payment.escrow.blockchain_tx_hash,
        custodyAmount: payment.escrow.custody_amount,
        releaseAmount: payment.escrow.release_amount,
        status: payment.escrow.status,
        custodyEnd: payment.escrow.custody_end,
        createdAt: payment.escrow.created_at
      } : null,
      events: events.map(event => ({
        id: event.id,
        type: event.type,
        description: event.description,
        isAutomatic: event.is_automatic,
        createdAt: event.created_at
      })),
      validation: {
        valid: validation.valid,
        errors: validation.errors
      },
      recommendations: generateRecommendations(payment, events, validation)
    });

  } catch (error: any) {
    console.error('❌ Operation Details Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate recommendations for manual intervention
 */
function generateRecommendations(payment: Payment, events: PaymentEvent[], validation: any): string[] {
  const recommendations: string[] = [];

  if (payment.status === 'funded' && payment.escrow && !payment.escrow.smart_contract_escrow_id) {
    recommendations.push('🔧 Escrow creation failed after bridge transfer - Manual recovery recommended');
    
    if (validation.valid) {
      recommendations.push('✅ Prerequisites validated - Safe to retry escrow creation');
    } else {
      recommendations.push('⚠️ Prerequisites validation failed - Review errors before retry');
    }

    const errorEvents = events.filter(e => e.type === 'automation_error' || e.type === 'escrow_recovery_failed');
    if (errorEvents.length >= 3) {
      recommendations.push('🚨 Multiple retry attempts failed - Consider rollback to return funds to Juno');
    }
  }

  if (payment.escrow && payment.escrow.custody_end && payment.escrow.custody_end < new Date()) {
    const overdueDays = Math.floor((new Date().getTime() - payment.escrow.custody_end.getTime()) / (1000 * 60 * 60 * 24));
    recommendations.push(`⏰ Escrow custody period expired ${overdueDays} days ago - Release required`);
  }

  return recommendations;
}

/**
 * Run safety monitor manually
 */
export const runSafetyMonitor = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔧 Manual safety monitor execution initiated');

    const results = await EscrowSafetyService.runSafetyMonitor();

    res.json({
      success: true,
      results,
      message: `Safety monitor completed. Processed ${results.recoveryResults.length} operations, sent ${results.alertsSent} alerts.`
    });

  } catch (error: any) {
    console.error('❌ Manual Safety Monitor Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
