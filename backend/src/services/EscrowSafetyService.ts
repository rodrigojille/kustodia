import AppDataSource from '../ormconfig';
import { Payment } from '../entity/Payment';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { createEscrow, checkAndUnpauseIfNeeded } from './escrowService';
import { sendEmail } from '../utils/emailService';
import { sendPaymentEventNotification } from '../utils/paymentNotificationService';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

export interface EscrowRecoveryResult {
  success: boolean;
  escrowId?: number;
  transactionHash?: string;
  error?: string;
  action: 'recovered' | 'rollback_required' | 'manual_intervention';
}

export interface StuckEscrowCase {
  paymentId: string;
  bridgeTransferCompleted: boolean;
  escrowCreated: boolean;
  fundAmount: number;
  currency: string;
  custodyAmount?: number;
  lastAttempt?: Date;
  lastError?: string;
  retryCount: number;
  status: 'pending_retry' | 'max_retries_reached' | 'manual_review';
}

export class EscrowSafetyService {
  
  /**
   * 1. PREVENTION: Check if escrow creation is safe before bridge transfer
   */
  static async validateEscrowPrerequisites(paymentId: number): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      
      // Check if payment exists
      const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['escrow']
      });
      
      if (!payment) {
        errors.push(`Payment ${paymentId} not found`);
        return { valid: false, errors };
      }
      
      // Check if escrow configuration exists
      if (!payment.escrow) {
        errors.push(`No escrow configuration found for payment ${paymentId}`);
        return { valid: false, errors };
      }
      
      // Validate escrow already has smart contract
      if (payment.escrow.smart_contract_escrow_id) {
        errors.push(`Escrow already exists with ID: ${payment.escrow.smart_contract_escrow_id}`);
      }
      
      // Validate bridge transfer completed
      if (payment.status !== 'funded') {
        errors.push(`Payment status is '${payment.status}', expected 'funded'`);
      }
      
      // Validate custody configuration
      if (!payment.escrow.custody_percent || payment.escrow.custody_percent <= 0) {
        errors.push('Invalid custody percentage configuration');
      }
      
      // Validate smart contract connectivity
      try {
        const contractTest = await EscrowSafetyService.testSmartContractConnection();
        if (!contractTest.success) {
          errors.push(`Smart contract connectivity failed: ${contractTest.error}`);
        }
      } catch (contractError: any) {
        errors.push(`Smart contract test failed: ${contractError.message}`);
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
      
    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
      return { valid: false, errors };
    }
  }

  /**
   * 2. DETECTION: Find stuck escrow cases
   */
  static async detectStuckEscrows(): Promise<StuckEscrowCase[]> {
    const stuckCases: StuckEscrowCase[] = [];
    
    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      const escrowRepo = AppDataSource.getRepository(Escrow);
      
      // Find payments that are funded but don't have active escrows
      const fundedPayments = await paymentRepo.find({
        where: { 
          status: 'funded'
        },
        relations: ['escrow']
      });
      
      for (const payment of fundedPayments) {
        // Check if payment has escrow but no smart contract ID
        const hasEscrow = payment.escrow;
        const hasSmartContract = hasEscrow && hasEscrow.smart_contract_escrow_id;
        
        if (hasEscrow && !hasSmartContract) {
          const custodyAmount = Number(hasEscrow.custody_amount);
          
          stuckCases.push({
            paymentId: payment.id.toString(),
            fundAmount: Number(payment.amount),
            currency: payment.currency,
            custodyAmount,
            bridgeTransferCompleted: payment.status === 'funded',
            escrowCreated: false,
            retryCount: 0,
            status: 'pending_retry',
            lastError: 'Escrow creation failed after bridge transfer completed'
          });
        }
      }
      
      return stuckCases;
      
    } catch (error: any) {
      console.error('❌ Error detecting stuck escrows:', error);
      return [];
    }
  }

  /**
   * 3. RECOVERY: Attempt to recover stuck escrow
   */
  static async recoverStuckEscrow(paymentId: number): Promise<EscrowRecoveryResult> {
    try {
      console.log(`🔄 Attempting escrow recovery for payment ${paymentId}`);
      
      const paymentRepo = AppDataSource.getRepository(Payment);
      const eventRepo = AppDataSource.getRepository(PaymentEvent);
      
      // Get payment with escrow relation
      const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: ['escrow']
      });
      
      if (!payment) {
        throw new Error(`Payment ${paymentId} not found`);
      }
      
      if (!payment.escrow) {
        throw new Error(`No escrow configuration for payment ${paymentId}`);
      }
      
      // Calculate custody details
      const custodyAmount = Number(payment.escrow.custody_amount);
      const custodyEndDate = payment.escrow.custody_end || new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Check if contract is paused and unpause if needed
      console.log('🔍 Checking if escrow contract is paused...');
      const wasUnpaused = await checkAndUnpauseIfNeeded();
      if (wasUnpaused) {
        console.log('✅ Contract was paused and has been unpaused');
      }
      
      // Create escrow on smart contract
      const escrowResult = await createEscrow({
        payer: getCurrentNetworkConfig().bridgeWallet,
        payee: getCurrentNetworkConfig().bridgeWallet,
        token: getCurrentNetworkConfig().mxnbTokenAddress,
        amount: custodyAmount.toString(),
        deadline: Math.floor(custodyEndDate.getTime() / 1000),
        vertical: payment.vertical_type || '',
        clabe: payment.deposit_clabe || '',
        conditions: 'flow1-platform-managed-custody'
      });
      
      if (!escrowResult?.escrowId) {
        throw new Error('Escrow creation failed to return a valid ID');
      }
      
      // Fund the escrow (pausable contract requires separate funding step)
      console.log(`💰 Funding escrow ${escrowResult.escrowId} with ${custodyAmount} tokens...`);
      const { fundEscrow } = await import('./escrowService');
      const fundTxHash = await fundEscrow(escrowResult.escrowId, getCurrentNetworkConfig().mxnbTokenAddress, custodyAmount.toString());
      console.log(`✅ Escrow funded successfully: ${fundTxHash}`);
      
      // Update escrow with smart contract details
      payment.escrow.smart_contract_escrow_id = escrowResult.escrowId;
      payment.escrow.blockchain_tx_hash = escrowResult.txHash;
      payment.escrow.status = 'active';
      
      await AppDataSource.getRepository(Escrow).save(payment.escrow);
      
      // Update payment status
      payment.status = 'escrowed';
      await AppDataSource.getRepository(Payment).save(payment);
      
      // Log recovery success
      const recoveryEvent = new PaymentEvent();
      recoveryEvent.paymentId = payment.id;
      recoveryEvent.type = 'escrow_recovery_success';
      recoveryEvent.description = JSON.stringify({
        escrowId: escrowResult.escrowId,
        transactionHash: escrowResult.txHash,
        custodyAmount,
        recoveryTimestamp: new Date().toISOString()
      });
      await AppDataSource.getRepository(PaymentEvent).save(recoveryEvent);
      
      console.log(`✅ Escrow recovery successful for payment ${paymentId}`);
      
      return {
        success: true,
        escrowId: parseInt(escrowResult.escrowId),
        transactionHash: escrowResult.txHash,
        action: 'recovered'
      };
      
    } catch (error: any) {
      console.error(`❌ Escrow recovery failed for payment ${paymentId}:`, error);
      
      // Log recovery failure
      try {
        const failureEvent = new PaymentEvent();
        failureEvent.paymentId = paymentId;
        failureEvent.type = 'escrow_recovery_failed';
        failureEvent.description = JSON.stringify({
          error: error.message,
          attemptTimestamp: new Date().toISOString(),
          paymentId
        });
        await AppDataSource.getRepository(PaymentEvent).save(failureEvent);
      } catch (logError: any) {
        console.error('Failed to log recovery failure:', logError);
      }
      
      return {
        success: false,
        error: error.message,
        action: 'manual_intervention'
      };
    }
  }

  /**
   * 4. ROLLBACK: Return funds to Juno if escrow creation permanently fails
   */
  static async initiateRollback(paymentId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔄 Initiating rollback for payment ${paymentId}`);
      
      const eventRepo = AppDataSource.getRepository(PaymentEvent);
      
      // TODO: Implement actual rollback logic to return funds to Juno
      // For now, we'll mark for manual intervention
      
      console.log(`⚠️ Rollback initiated for Payment ${paymentId} - Manual intervention required`);
      
      // Log rollback initiation
      const rollbackEvent = new PaymentEvent();
      rollbackEvent.paymentId = paymentId;
      rollbackEvent.type = 'rollback_initiated';
      rollbackEvent.description = JSON.stringify({
        reason: 'escrow_creation_failed',
        rollbackTimestamp: new Date().toISOString(),
        paymentId: paymentId.toString()
      });
      await eventRepo.save(rollbackEvent);
      
      // Send alert to admin
      await sendEmail({
        to: 'admin@kustodia.mx',
        subject: '🚨 Manual Rollback Required',
        html: `
          <div style="font-family:Arial,sans-serif;color:#d32f2f;">
            <h2>🚨 Manual Rollback Required</h2>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Issue:</strong> Escrow creation failed after maximum retries</p>
            <p><strong>Action Required:</strong> Manual intervention to return funds to Juno</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      });
      
      return { success: true };
      
    } catch (error: any) {
      console.error(`❌ Rollback failed for payment ${paymentId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 5. MONITORING: Run safety checks
   */
  static async runSafetyCheck(): Promise<{
    stuckEscrows: StuckEscrowCase[];
    recoveryResults: EscrowRecoveryResult[];
    alertsSent: number;
  }> {
    console.log('[EscrowSafetyService] Running safety check...');

    const stuckEscrows = await this.detectStuckEscrows();
    const recoveryResults: EscrowRecoveryResult[] = [];
    let alertsSent = 0;

    for (const stuckCase of stuckEscrows) {
      const paymentId = parseInt(stuckCase.paymentId);
      if (stuckCase.status === 'pending_retry' && stuckCase.retryCount < 3) {
        console.log(`[EscrowSafetyService] Attempting recovery for Payment ${stuckCase.paymentId}`);
        const result = await this.recoverStuckEscrow(paymentId);
        recoveryResults.push(result);

        if (!result.success && stuckCase.retryCount >= 2) {
          // Initiate rollback after 3 failed attempts
          await this.initiateRollback(paymentId);
          alertsSent++;
        }
      } else if (stuckCase.status === 'max_retries_reached') {
        await this.initiateRollback(paymentId);
        alertsSent++;
      }
    }

    console.log(`[EscrowSafetyService] Safety check completed: ${stuckEscrows.length} stuck cases, ${recoveryResults.filter(r => r.success).length} recovered`);

    return {
      stuckEscrows,
      recoveryResults,
      alertsSent
    };
  }

  /**
   * Test smart contract connection
   */
  static async testSmartContractConnection(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Simple test to verify contract is accessible
      const { ethers } = require('ethers');
      const provider = new ethers.JsonRpcProvider(getCurrentNetworkConfig().rpcUrl);
      const code = await provider.getCode(process.env.KUSTODIA_ESCROW_V2_ADDRESS);
      
      if (code === '0x') {
        return { success: false, error: 'Contract not deployed at address' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }



  /**
   * Run the safety monitor to check for stuck operations
   */
  static async runSafetyMonitor(): Promise<{
    recoveryResults: EscrowRecoveryResult[];
    alertsSent: number;
  }> {
    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      const recoveryResults: EscrowRecoveryResult[] = [];
      let alertsSent = 0;

      // Find payments that need recovery
      const stuckPayments = await paymentRepo.find({
        where: { status: 'funded' },
        relations: ['escrow']
      });

      for (const payment of stuckPayments) {
        if (payment.escrow && !payment.escrow.smart_contract_escrow_id) {
          const result = await this.recoverStuckEscrow(payment.id);
          recoveryResults.push(result);

          if (!result.success) {
            // Send alert for failed recovery
            await sendEmail({
              to: 'admin@kustodia.mx',
              subject: '🚨 Escrow Recovery Failed - Manual Intervention Required',
              html: `
                <div style="font-family:Arial,sans-serif;color:#f44336;">
                  <h2>🚨 Escrow Recovery Failed</h2>
                  <p><strong>Payment ID:</strong> ${payment.id}</p>
                  <p><strong>Error:</strong> ${result.error}</p>
                  <p><strong>Action Required:</strong> ${result.action}</p>
                  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                </div>
              `
            });
            alertsSent++;
          }
        }
      }

      return { recoveryResults, alertsSent };
    } catch (error: any) {
      console.error('Safety monitor error:', error);
      return { recoveryResults: [], alertsSent: 0 };
    }
  }
}
