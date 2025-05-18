"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
async function main() {
    await ormconfig_1.default.initialize();
    // Create or find a test user with a CLABE
    let user = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { email: 'test-seller@kustodia.mx' } });
    if (!user) {
        user = ormconfig_1.default.getRepository(User_1.User).create({
            email: 'test-seller@kustodia.mx',
            password_hash: 'testhash', // Not used for login
            deposit_clabe: '710969000047317763', // Use correct property name if User entity has it
            full_name: 'Test Seller',
            email_verified: true,
            kyc_status: 'approved',
        });
        await ormconfig_1.default.getRepository(User_1.User).save(user);
    }
    // Create a payment
    const payment = ormconfig_1.default.getRepository(Payment_1.Payment).create({
        user,
        recipient_email: 'test-seller@kustodia.mx',
        amount: 100,
        currency: 'MXN',
        description: 'Test payment',
        status: 'funded',
    });
    await ormconfig_1.default.getRepository(Payment_1.Payment).save(payment);
    // Create an escrow
    const escrow = ormconfig_1.default.getRepository(Escrow_1.Escrow).create({
        payment,
        custody_percent: 20,
        custody_amount: 20,
        release_amount: 80,
        status: 'active',
        dispute_status: 'none',
        custody_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    });
    await ormconfig_1.default.getRepository(Escrow_1.Escrow).save(escrow);
    console.log('Test escrow created:', escrow);
    process.exit(0);
}
main();
