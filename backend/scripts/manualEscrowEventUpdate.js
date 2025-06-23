"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const ormconfig_1 = __importDefault(require("../src/ormconfig"));
const Escrow_1 = require("../src/entity/Escrow");
const Payment_1 = require("../src/entity/Payment");
const PaymentEvent_1 = require("../src/entity/PaymentEvent");
async function main() {
    await ormconfig_1.default.initialize();
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    // --- UPDATE THESE VALUES AS NEEDED ---
    const escrowId = 59; // Escrow to update
    const txHash = "0xc3d13d1bdf92e8c056bb7657786fde56e276c465ba32b553b95829919b228133"; // Your on-chain tx hash
    // Fetch escrow and payment
    const escrow = await escrowRepo.findOne({ where: { id: escrowId }, relations: ["payment"] });
    if (!escrow) {
        console.error(`Escrow ${escrowId} not found`);
        process.exit(1);
    }
    const payment = await paymentRepo.findOne({ where: { id: escrow.payment.id } });
    if (!payment) {
        console.error(`Payment ${escrow.payment.id} not found`);
        process.exit(1);
    }
    // Log PaymentEvent for retroactive timeline update
    await paymentEventRepo.save(paymentEventRepo.create({
        paymentId: payment.id,
        type: "escrow_funded_onchain",
        description: `MXNB bloqueados en escrow on-chain. TxHash: ${txHash}`
    }));
    console.log(`Retroactive PaymentEvent logged for payment ${payment.id} with txHash.`);
    await ormconfig_1.default.destroy();
}
main();
