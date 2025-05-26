/**
 * Script para liberar custodias expiradas y procesar pagos pendientes.
 * Ejecutar como cronjob en producción, por ejemplo:
 *   * * * * * /usr/bin/node /path/to/releaseExpiredCustodies.js
 *
 * Este script busca escrows activos y expirados, los libera y paga al vendedor.
 * Salida y logs claros para monitoreo.
 *
 * Para monitoreo avanzado, configura la variable de entorno SENTRY_DSN con tu DSN de Sentry.
 */
import ormconfig from '../ormconfig';
import { releaseEscrowAndPayout } from '../services/payoutService';
import { Escrow } from '../entity/Escrow';
import { LessThanOrEqual } from 'typeorm';
import Sentry from '../utils/sentry';

process.on('unhandledRejection', (reason: any) => {
  Sentry.captureException(reason);
  console.error('UnhandledRejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err: any) => {
  Sentry.captureException(err);
  console.error('UncaughtException:', err);
  process.exit(1);
});

async function main() {
  // Log la URL de conexión de la base de datos
  console.log('[LOG] DATABASE_URL:', process.env.DATABASE_URL);
  await ormconfig.initialize();
  const escrowRepo = ormconfig.getRepository(Escrow);
  const now = new Date();
  const expiredEscrows = await escrowRepo.find({
    where: {
      status: 'active',
      custody_end: LessThanOrEqual(now)
    },
    relations: ['payment']
  });
  if (expiredEscrows.length === 0) {
    console.log(`[${now.toISOString()}] No expired escrows to release.`);
    process.exit(0);
  }
  let success = 0, failed = 0;
  for (const escrow of expiredEscrows) {
    try {
      const result = await releaseEscrowAndPayout(escrow.id);
      console.log(`[${now.toISOString()}] Escrow ${escrow.id} released. Payment status: ${result.payment.status}`);
      success++;
    } catch (err) {
      Sentry.captureException(err);
      console.error(`[${now.toISOString()}] Error releasing escrow ${escrow.id}:`, err);
      failed++;
    }
  }
  console.log(`[${now.toISOString()}] Release summary: ${success} success, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
