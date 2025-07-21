"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const payoutService_1 = require("../services/payoutService");
async function main() {
    const escrowId = Number(process.argv[2]);
    if (!escrowId) {
        console.error('Usage: ts-node manualPayout.ts <escrowId>');
        process.exit(1);
    }
    // 🔐 SECURITY WARNING: Manual override bypasses normal approval flow
    console.warn('⚠️  WARNING: Manual payout bypasses normal approval process!');
    console.warn('⚠️  Ensure dual approval validation is met for Flow 2 payments!');
    console.warn('⚠️  This should only be used for emergency situations!');
    await ormconfig_1.default.initialize();
    try {
        const result = await (0, payoutService_1.releaseEscrowAndPayout)(escrowId);
        console.log('Payout result:', result);
        process.exit(0);
    }
    catch (err) {
        console.error('Error executing payout:', err);
        process.exit(1);
    }
}
main();
