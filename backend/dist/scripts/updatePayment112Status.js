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
        // Get payment and escrow
        const payment = await paymentRepo.findOne({
            where: { id: 112 },
            relations: ['escrow']
        });
        if (!payment || !payment.escrow) {
            console.log('Payment 112 or its escrow not found');
            return;
        }
        console.log('Current Status:');
        console.log(`  Payment Status: ${payment.status}`);
        console.log(`  Escrow Status: ${payment.escrow.status}`);
        // Update escrow to released status with the known release tx hash
        payment.escrow.status = 'released';
        payment.escrow.release_tx_hash = '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d';
        payment.escrow.release_amount = 10000.00;
        // Update payment status to funded so automation can process it
        payment.status = 'funded';
        await escrowRepo.save(payment.escrow);
        await paymentRepo.save(payment);
        console.log('\nUpdated Status:');
        console.log(`  Payment Status: ${payment.status}`);
        console.log(`  Escrow Status: ${payment.escrow.status}`);
        console.log(`  Release Amount: ${payment.escrow.release_amount}`);
        console.log(`  Release TX Hash: ${payment.escrow.release_tx_hash}`);
        console.log('\n✅ Database updated! The automation should pick this up in the next run.');
        console.log('The processPendingPayouts cron job runs every 2 minutes.');
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await ormconfig_1.default.destroy();
    }
}
main();
