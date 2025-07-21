"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const typeorm_1 = require("typeorm");
// List of legacy payment IDs that are causing errors
const legacyPaymentIds = [
    14, 18, 19, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 54, 56, 58, 60, 61, 70, 81, 84
];
async function cancelLegacyPayments() {
    console.log('🔵 Initializing data source...');
    try {
        await ormconfig_1.default.initialize();
        console.log('✅ Data source initialized.');
        const paymentRepository = ormconfig_1.default.getRepository(Payment_1.Payment);
        console.log(`🔵 Finding ${legacyPaymentIds.length} legacy payments to cancel...`);
        const paymentsToCancel = await paymentRepository.findBy({
            id: (0, typeorm_1.In)(legacyPaymentIds),
        });
        if (paymentsToCancel.length === 0) {
            console.log('🟡 No legacy payments found with the specified IDs. Exiting.');
            return;
        }
        console.log(`Found ${paymentsToCancel.length} payments. Updating status to 'cancelled'...`);
        for (const payment of paymentsToCancel) {
            console.log(`- Cancelling payment ${payment.id} (current status: ${payment.status})`);
            payment.status = 'cancelled';
            await paymentRepository.save(payment);
            console.log(`  ✅ Payment ${payment.id} status updated to 'cancelled'.`);
        }
        console.log('🟢 All specified legacy payments have been cancelled.');
    }
    catch (error) {
        console.error('❌ Error during script execution:', error);
    }
    finally {
        if (ormconfig_1.default.isInitialized) {
            await ormconfig_1.default.destroy();
            console.log('⚪️ Data source connection closed.');
        }
    }
}
cancelLegacyPayments().catch(error => {
    console.error('❌ Fatal error running cancelLegacyPayments script:', error);
    process.exit(1);
});
