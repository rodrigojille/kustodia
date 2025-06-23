import { createEscrow } from '../services/escrowService';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Parámetros para el test manual:
  const sellerAddress = process.env.PLATFORM_WALLET_ADDRESS!; // Usa la wallet de la plataforma
  const custodyAmount = '2000000000000000000000'; // 2,000 MXNB en wei (ajusta según decimales)
  const custodyPeriod = 604800; // 7 días en segundos

  if (!sellerAddress) {
    throw new Error('Falta PLATFORM_WALLET_ADDRESS en .env');
  }

  console.log('Iniciando test de depósito a escrow...');
  console.log('Seller (plataforma):', sellerAddress);
  console.log('Monto (wei):', custodyAmount);
  console.log('Periodo de custodia (segundos):', custodyPeriod);

  try {
    // Updated for KustodiaEscrow2_0 API
    const result = await createEscrow({
      payer: process.env.ESCROW_BRIDGE_WALLET || sellerAddress, // Bridge wallet as payer
      payee: sellerAddress, // Seller as payee
      token: process.env.MOCK_ERC20_ADDRESS!, // MXNB token
      amount: custodyAmount, // Amount to lock
      deadline: Math.floor(Date.now() / 1000) + custodyPeriod, // Deadline in seconds
      vertical: 'deposit', // Business vertical
      clabe: '', // No CLABE for direct deposit
      conditions: 'Direct deposit escrow test' // Escrow conditions
    });
    console.log('Escrow creado exitosamente:', result);
  } catch (err: any) {
    console.error('Error al crear escrow:', err);
    process.exit(1);
  }
}

main();
