"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escrowService_1 = require("../services/escrowService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    // Parámetros para el test manual:
    const sellerAddress = process.env.BRIDGE_WALLET_ADDRESS; // Usa la wallet de la plataforma
    const custodyAmount = '2000000000000000000000'; // 2,000 MXNB en wei (ajusta según decimales)
    const custodyPeriod = 604800; // 7 días en segundos
    if (!sellerAddress) {
        throw new Error('Falta BRIDGE_WALLET_ADDRESS en .env');
    }
    console.log('Iniciando test de depósito a escrow...');
    console.log('Seller (plataforma):', sellerAddress);
    console.log('Monto (wei):', custodyAmount);
    console.log('Periodo de custodia (segundos):', custodyPeriod);
    try {
        // Updated for KustodiaEscrow2_0 API
        const result = await (0, escrowService_1.createEscrow)({
            payer: sellerAddress, // Bridge wallet as payer
            payee: sellerAddress, // Seller as payee
            token: process.env.MOCK_ERC20_ADDRESS, // MXNB token
            amount: custodyAmount, // Amount to lock
            deadline: Math.floor(Date.now() / 1000) + custodyPeriod, // Deadline in seconds
            vertical: 'deposit', // Business vertical
            clabe: '', // No CLABE for direct deposit
            conditions: 'Direct deposit escrow test' // Escrow conditions
        });
        console.log('Escrow creado exitosamente:', result);
    }
    catch (err) {
        console.error('Error al crear escrow:', err);
        process.exit(1);
    }
}
main();
