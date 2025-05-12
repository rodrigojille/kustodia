"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payoutService_1 = require("../services/payoutService");
const ormconfig_1 = __importDefault(require("../ormconfig"));
async function main() {
    const escrowId = Number(process.argv[2]);
    if (!escrowId) {
        console.error('Usage: ts-node src/scripts/testPayout.ts <escrowId>');
        process.exit(1);
    }
    try {
        await ormconfig_1.default.initialize();
        const result = await (0, payoutService_1.releaseEscrowAndPayout)(escrowId);
        console.log('Payout result:', result);
        process.exit(0);
    }
    catch (err) {
        console.error('Payout failed:', err);
        process.exit(1);
    }
}
main();
