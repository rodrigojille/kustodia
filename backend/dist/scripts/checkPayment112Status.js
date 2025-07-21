"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
async function main() {
    await ormconfig_1.default.initialize();
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
        const payment = await paymentRepo.findOne({
            where: { id: 112 },
            relations: ['escrow']
        });
        if (!payment) {
            console.log('Payment 112 not found');
            return;
        }
        console.log('Payment 112 Status:');
        console.log(`  Payment Status: ${payment.status}`);
        console.log(`  Escrow ID: ${payment.escrow?.id}`);
        console.log(`  Escrow Status: ${payment.escrow?.status}`);
        console.log(`  Release Amount: ${payment.escrow?.release_amount}`);
        console.log(`  Release TX Hash: ${payment.escrow?.release_tx_hash}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await ormconfig_1.default.destroy();
    }
}
main();
