"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const escrowService_1 = require("../services/escrowService");
/**
 * Script para consultar cuánto tiempo falta para que termine el periodo de custodia de un escrow en el contrato KustodiaEscrow.
 * Muestra tiempo restante, fecha/hora de inicio y fin del periodo (local y UTC).
 * Uso: npx ts-node src/scripts/queryEscrowTime.ts <escrowId>
 */
async function main() {
    const escrowId = Number(process.argv[2]);
    if (isNaN(escrowId)) {
        console.error('Usage: ts-node queryEscrowTime.ts <escrowId>');
        process.exit(1);
    }
    const escrow = await (0, escrowService_1.getEscrow)(escrowId);
    if (!escrow) {
        console.error('Escrow not found');
        process.exit(1);
    }
    const custodyEnd = escrow.custodyEnd ? Number(escrow.custodyEnd) : 0;
    const custodyStart = custodyEnd && escrow.custodyPeriod ? Number(custodyEnd) - Number(escrow.custodyPeriod) : 0;
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = custodyEnd - now;
    const fechaInicio = new Date(custodyStart * 1000);
    const fechaFin = new Date(custodyEnd * 1000);
    if (secondsLeft <= 0) {
        console.log(`El periodo de custodia para el escrowId ${escrowId} ya terminó.`);
    }
    else {
        const horas = Math.floor(secondsLeft / 3600);
        const minutos = Math.floor((secondsLeft % 3600) / 60);
        const segundos = secondsLeft % 60;
        console.log(`Faltan ${horas}h ${minutos}m ${segundos}s para que termine el periodo de custodia del escrowId ${escrowId}.`);
    }
    console.log(`Fecha/hora inicio (local): ${fechaInicio.toLocaleString()}`);
    console.log(`Fecha/hora inicio (UTC):   ${fechaInicio.toISOString()}`);
    console.log(`Fecha/hora fin (local):    ${fechaFin.toLocaleString()}`);
    console.log(`Fecha/hora fin (UTC):      ${fechaFin.toISOString()}`);
}
main();
