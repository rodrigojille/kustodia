import { LessThanOrEqual, In } from "typeorm";
import ormconfig from '../ormconfig';
import { Escrow } from '../entity/Escrow';
import { releaseCustody } from '../services/escrowService';
import { releaseEscrowAndPayout } from '../services/payoutService';

/**
 * This script runs as a background monitor to automatically release expired custodies
 * and trigger the payout flow for each eligible escrow.
 *
 * Recommended to run as a persistent process (e.g., pm2, systemd, Docker, etc).
 */

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function processExpiredCustodies() {
  try {
    await ormconfig.initialize();
  } catch (err: any) {
    if (
      err.name !== 'AlreadyHasActiveConnectionError' &&
      err.name !== 'CannotConnectAlreadyConnectedError'
    ) {
      throw err;
    }
    // Otherwise, connection is already established; continue
  }
  const escrowRepo = ormconfig.getRepository(Escrow);

  // Find escrows where custody_end has passed and status is 'active' or 'custody'
  const now = new Date();
  const expiredEscrows = await escrowRepo.find({
    where: {
      custody_end: LessThanOrEqual(now),
      status: In(['active', 'custody'])
    }
  });

  if (expiredEscrows.length === 0) {
    console.log(`[custodyMonitor] No expired custodies found at ${now.toISOString()}`);
    return;
  }

  console.log(`[custodyMonitor] Found ${expiredEscrows.length} expired custodies at ${now.toISOString()}`);

  for (const escrow of expiredEscrows) {
    try {
      console.log(`[custodyMonitor] Releasing custody for escrowId=${escrow.id}`);
      await releaseCustody(escrow.id);
      console.log(`[custodyMonitor] Custody released on-chain for escrowId=${escrow.id}`);
      await releaseEscrowAndPayout(escrow.id);
      console.log(`[custodyMonitor] Payout triggered for escrowId=${escrow.id}`);
      // Optionally update escrow.status here if not handled by payoutService
    } catch (err) {
      console.error(`[custodyMonitor] Error processing escrowId=${escrow.id}:`, err);
    }
  }
}

async function startMonitor() {
  console.log('[custodyMonitor] Starting custody monitor...');
  await processExpiredCustodies(); // Run immediately on start
  setInterval(processExpiredCustodies, CHECK_INTERVAL_MS);
}

startMonitor().catch(err => {
  console.error('[custodyMonitor] Fatal error:', err);
  process.exit(1);
});
