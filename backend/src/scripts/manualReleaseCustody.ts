import ormconfig from '../ormconfig';
import { ethers } from 'ethers';
import { escrowContract } from '../services/escrowService';

async function main() {
  const escrowId = Number(process.argv[2]);
  if (isNaN(escrowId)) {
    console.error('Usage: ts-node manualReleaseCustody.ts <escrowId>');
    process.exit(1);
  }
  await ormconfig.initialize();
  try {
    // Updated for KustodiaEscrow2_0 API - use release() instead of releaseCustody()
    const tx = await escrowContract.release(escrowId);
    let txHash = tx.hash;
    if (txHash && typeof txHash.then === 'function') {
      txHash = await txHash;
    }
    console.log('Submitted release transaction. Hash:', txHash);
    try {
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
    } catch (waitErr) {
      console.error('Error waiting for transaction receipt:', waitErr);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error releasing custody:', err);
    process.exit(1);
  }
}

main();
