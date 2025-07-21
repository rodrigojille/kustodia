"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const junoService_1 = require("../services/junoService");
const { JUNO_TEST_SELLER_BANK_ACCOUNT_ID } = process.env;
async function testRedemption() {
    console.log('--- 🚀 Starting Juno Redemption Test ---');
    try {
        // Initialize DB connection to load entities and configs if needed by services
        await ormconfig_1.default.initialize();
        console.log('✅ Database connection initialized.');
        if (!JUNO_TEST_SELLER_BANK_ACCOUNT_ID) {
            throw new Error('JUNO_TEST_SELLER_BANK_ACCOUNT_ID is not set in the environment variables.');
        }
        const amount = 5000.00;
        const destination_bank_account_id = JUNO_TEST_SELLER_BANK_ACCOUNT_ID;
        console.log(`[JUNO] Attempting to redeem ${amount} MXN to bank account ${destination_bank_account_id}...`);
        const result = await (0, junoService_1.redeemMXNbForMXN)(amount, destination_bank_account_id);
        console.log('--- ✅ Juno Redemption Successful ---');
        console.log('Response Payload:');
        console.log(JSON.stringify(result, null, 2));
    }
    catch (err) {
        console.error('--- ❌ ERROR during Juno Redemption Test ---');
        console.error('Caught error:', err);
        if (err.response?.data) {
            console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
        }
    }
    finally {
        if (ormconfig_1.default.isInitialized) {
            await ormconfig_1.default.destroy();
            console.log('✅ Database connection closed.');
        }
        console.log('--- 🏁 Test Finished ---');
    }
}
testRedemption();
