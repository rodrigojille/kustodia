"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const payoutService_1 = require("../services/payoutService");
async function main() {
    const escrowId = Number(process.argv[2]);
    const amount = Number(process.argv[3]);
    if (!escrowId || !amount) {
        console.error('Usage: ts-node testRedemption.ts <escrowId> <amountMXNB>');
        process.exit(1);
    }
    await ormconfig_1.default.initialize();
    try {
        const result = await (0, payoutService_1.redeemMXNBToMXNAndPayout)(escrowId, amount);
        console.log('Redemption result:', result);
        process.exit(0);
    }
    catch (err) {
        console.error('Error executing redemption:', err);
        process.exit(1);
    }
}
main();
