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
const escrowService_1 = require("../src/services/escrowService");
async function main() {
    await ormconfig_1.default.initialize();
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    // Fetch escrow 61 and linked payment
    const escrowId = 61;
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
    // Use bridge wallet as seller
    const seller = process.env.ESCROW_BRIDGE_WALLET;
    // MXNB uses 6 decimals (e.g., 1000 MXNB = 1000000000)
    const custodyAmount = (Number(escrow.custody_amount) * 1e6).toFixed(0); // string in base units
    // Use custody period in seconds (or adapt as needed)
    const custodyPeriod = Math.floor((new Date(escrow.custody_end).getTime() - Date.now()) / 1000);
    console.log(`Creating on-chain escrow for escrowId=${escrowId}, paymentId=${payment.id}`);
    console.log(`Seller (bridge wallet): ${seller}`);
    console.log(`Custody amount: ${custodyAmount} (base units)`);
    console.log(`Custody period: ${custodyPeriod} seconds`);
    try {
        const result = await (0, escrowService_1.createEscrow)({ seller, custodyAmount, custodyPeriod });
        console.log("Escrow created on-chain:", result);
        // Update DB with tx hash and smart contract escrow ID
        escrow.blockchain_tx_hash = result.txHash;
        escrow.smart_contract_escrow_id = result.escrowId;
        await escrowRepo.save(escrow);
        console.log(`DB updated for escrow ${escrowId}: txHash and smart_contract_escrow_id saved.`);
        // Log PaymentEvent for timeline
        const paymentEventRepo = ormconfig_1.default.getRepository(require("../src/entity/PaymentEvent").PaymentEvent);
        await paymentEventRepo.save(paymentEventRepo.create({
            paymentId: payment.id,
            type: "escrow_funded_onchain",
            description: `MXNB bloqueados en escrow on-chain. TxHash: ${result.txHash}`
        }));
        console.log(`PaymentEvent logged for payment ${payment.id} with txHash.`);
    }
    catch (err) {
        console.error("Error creating on-chain escrow:", err);
    }
    finally {
        await ormconfig_1.default.destroy();
    }
}
main();
