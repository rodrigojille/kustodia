"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const escrowService_1 = require("../services/escrowService");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const humanAmount = process.argv[2];
    const to = '0xb9cBEa875dCbb3eFd42D36c04cdD6C122eD0C7C9'; // Always send to platform Juno wallet
    const DECIMALS = 6;
    if (!humanAmount || isNaN(Number(humanAmount))) {
        console.error('Usage: ts-node src/scripts/testMXNBTransferToJuno.ts <amount>');
        console.error('Example: ts-node src/scripts/testMXNBTransferToJuno.ts 2    # sends 2 MXNB');
        process.exit(1);
    }
    // Convert human-readable to contract amount
    const amount = (BigInt(Math.round(Number(humanAmount) * 10 ** DECIMALS))).toString();
    console.log(`Preparing to send ${humanAmount} MXNB (${amount} base units, 6 decimals) to Juno wallet...`);
    try {
        const txHash = await (0, escrowService_1.transferMXNBToJunoWallet)(amount, to);
        console.log('MXNB transfer successful! Tx hash:', txHash);
        process.exit(0);
    }
    catch (err) {
        console.error('MXNB transfer failed:', err);
        process.exit(1);
    }
}
main();
