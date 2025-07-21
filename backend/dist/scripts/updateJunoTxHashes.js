"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const JunoTransaction_1 = require("../entity/JunoTransaction");
const junoService_1 = require("../services/junoService");
const typeorm_1 = require("typeorm");
async function main() {
    await ormconfig_1.default.initialize();
    const repo = ormconfig_1.default.getRepository(JunoTransaction_1.JunoTransaction);
    const txs = await repo.find({
        where: {
            type: 'deposit',
            status: 'complete',
            tx_hash: (0, typeorm_1.IsNull)(),
            reference: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
        },
    });
    if (txs.length === 0) {
        console.log('No pending deposits found for hash update.');
        process.exit(0);
    }
    let updated = 0;
    for (const tx of txs) {
        const hash = await (0, junoService_1.getJunoTxHashFromTimeline)(tx.reference);
        if (!hash) {
            console.log(`No hash found for transaction ${tx.id} (reference: ${tx.reference})`);
            continue;
        }
        tx.tx_hash = hash;
        await repo.save(tx);
        console.log(`Updated transaction ${tx.id} with hash ${hash}`);
        updated++;
    }
    console.log(`Total updated: ${updated}`);
    process.exit(0);
}
main().catch((err) => {
    console.error('Error updating hashes:', err);
    process.exit(1);
});
