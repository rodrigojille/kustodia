import { EscrowSafetyService, EscrowRecoveryResult, StuckEscrowCase } from '../services/EscrowSafetyService';
import { sendEmail } from '../utils/emailService';

/**
 * Escrow Safety Monitor Job
 * Runs every 30 minutes to detect and recover stuck escrows
 */
export async function runEscrowSafetyMonitor() {
  console.log('[EscrowSafetyMonitor] Starting safety check...');
  
  try {
    const safetyResult = await EscrowSafetyService.runSafetyCheck();
    
    const {
      stuckEscrows,
      recoveryResults,
      alertsSent
    } = safetyResult;

    // Log results
    console.log(`[EscrowSafetyMonitor] Safety check completed:`);
    console.log(`  - Stuck escrows detected: ${stuckEscrows.length}`);
    console.log(`  - Recovery attempts: ${recoveryResults.length}`);
    console.log(`  - Successful recoveries: ${recoveryResults.filter(r => r.success).length}`);
    console.log(`  - Alerts sent: ${alertsSent}`);

    // Send summary report if there were issues
    if (stuckEscrows.length > 0 || alertsSent > 0) {
      await sendSafetyReport(safetyResult);
    }

    return {
      success: true,
      summary: {
        stuckEscrows: stuckEscrows.length,
        recoveries: recoveryResults.filter(r => r.success).length,
        failures: recoveryResults.filter(r => !r.success).length,
        alerts: alertsSent
      }
    };

  } catch (error: any) {
    console.error('[EscrowSafetyMonitor] Safety check failed:', error);
    
    // Send error alert
    await sendEmail({
      to: 'admin@kustodia.mx',
      subject: '🚨 Escrow Safety Monitor Failed',
      html: `
        <div style="font-family:Arial,sans-serif;color:#d32f2f;">
          <h2>🚨 Escrow Safety Monitor Error</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Stack:</strong></p>
          <pre style="background:#f5f5f5;padding:10px;border-radius:4px;">${error.stack}</pre>
        </div>
      `
    });

    return {
      success: false,
      error: error.message
    };
  }
}

async function sendSafetyReport(safetyResult: {
  stuckEscrows: StuckEscrowCase[];
  recoveryResults: EscrowRecoveryResult[];
  alertsSent: number;
}) {
  const {
    stuckEscrows,
    recoveryResults,
    alertsSent
  } = safetyResult;

  const successfulRecoveries = recoveryResults.filter((r: EscrowRecoveryResult) => r.success);
  const failedRecoveries = recoveryResults.filter((r: EscrowRecoveryResult) => !r.success);

  const html = `
    <div style="font-family:Arial,sans-serif;">
      <h2>🛡️ Escrow Safety Report</h2>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      
      <h3>📊 Summary</h3>
      <ul>
        <li><strong>Stuck Escrows Detected:</strong> ${stuckEscrows.length}</li>
        <li><strong>Successful Recoveries:</strong> ${successfulRecoveries.length}</li>
        <li><strong>Failed Recoveries:</strong> ${failedRecoveries.length}</li>
        <li><strong>Alerts Sent:</strong> ${alertsSent}</li>
      </ul>

      ${successfulRecoveries.length > 0 ? `
        <h3>✅ Successful Recoveries</h3>
        <ul>
          ${successfulRecoveries.map((r: EscrowRecoveryResult) => `
            <li>Escrow ID: ${r.escrowId} | TX: <a href="https://sepolia.arbiscan.io/tx/${r.transactionHash}" target="_blank">${r.transactionHash?.substring(0, 10)}...</a></li>
          `).join('')}
        </ul>
      ` : ''}

      ${failedRecoveries.length > 0 ? `
        <h3>❌ Failed Recoveries</h3>
        <ul>
          ${failedRecoveries.map((r: EscrowRecoveryResult) => `
            <li>Error: ${r.error} | Action: ${r.action}</li>
          `).join('')}
        </ul>
      ` : ''}

      ${stuckEscrows.length > 0 ? `
        <h3>⚠️ Stuck Escrow Cases</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr style="background:#f5f5f5;">
            <th style="border:1px solid #ddd;padding:8px;">Payment ID</th>
            <th style="border:1px solid #ddd;padding:8px;">Amount</th>
            <th style="border:1px solid #ddd;padding:8px;">Bridge Transfer</th>
            <th style="border:1px solid #ddd;padding:8px;">Retry Count</th>
            <th style="border:1px solid #ddd;padding:8px;">Status</th>
          </tr>
          ${stuckEscrows.map((stuck: StuckEscrowCase) => `
            <tr>
              <td style="border:1px solid #ddd;padding:8px;">${stuck.paymentId}</td>
              <td style="border:1px solid #ddd;padding:8px;">${stuck.fundAmount} ${stuck.currency}</td>
              <td style="border:1px solid #ddd;padding:8px;">${stuck.bridgeTransferCompleted ? '✅' : '❌'}</td>
              <td style="border:1px solid #ddd;padding:8px;">${stuck.retryCount}</td>
              <td style="border:1px solid #ddd;padding:8px;">${stuck.status}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
    </div>
  `;

  await sendEmail({
    to: 'admin@kustodia.mx',
    subject: `🛡️ Escrow Safety Report - ${new Date().toLocaleDateString()}`,
    html
  });
}
