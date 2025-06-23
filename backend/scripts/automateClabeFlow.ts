/**
 * Kustodia CLABE/SPEI End-to-End Orchestrator Skeleton
 *
 * Ejecuta el flujo completo: sincroniza depósitos, fondea escrow, libera, transfiere a Juno y redime/paga al vendedor.
 * Cada paso invoca el script correspondiente y maneja errores básicos.
 *
 * Llena la lógica de cada step y agrega validaciones/reintentos según necesidades de producción.
 */

import { execSync } from 'child_process';

const steps = [
  {
    name: 'Sincronizar depósitos SPEI',
    script: 'sync_juno_deposits.js',
    description: 'Payments fondeados y asociados en DB.'
  },
  {
    name: 'Fondear Escrow (custodia)',
    script: 'sendEscrowFunds.js',
    description: 'MXNBs transferidos de bridge wallet al escrow (on-chain).'
  },
  {
    name: 'Liberar Escrow (fin de custodia)',
    script: 'releaseEscrowFunds.js',
    description: 'MXNBs liberados del escrow al bridge wallet.'
  },
  {
    name: 'Enviar MXNBs a Juno para redención',
    script: 'sendFromBridgeToJuno.js',
    description: 'MXNBs transferidos a la wallet Juno.'
  },
  {
    name: 'Redimir MXNBs y pagar al vendedor',
    script: 'redeem_mxnb_to_fiat.js',
    description: 'Redención y SPEI payout al vendedor.'
  }
];

function runStep(step: {name: string, script: string, description: string}) {
  console.log(`\n=== Paso: ${step.name} ===`);
  try {
    execSync(`node dist-scripts/scripts/${step.script}`, { stdio: 'inherit' });
    console.log(`✔️  ${step.description}`);
  } catch (err) {
    console.error(`❌ Error en paso: ${step.name}`);
    // Aquí puedes agregar lógica de reintentos, alertas, o abortar el flujo
    throw err;
  }
}

function main() {
  for (const step of steps) {
    runStep(step);
  }
  console.log('\nFlujo CLABE/SPEI completado. Revisa la timeline y logs para confirmar.');
}

main();
