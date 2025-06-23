"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const escrowService_1 = require("../src/services/escrowService");
console.log('Starting testEscrow.ts');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ESCROW_CONTRACT_ADDRESS:', process.env.ESCROW_CONTRACT_ADDRESS);
console.log('ESCROW_PRIVATE_KEY:', process.env.ESCROW_PRIVATE_KEY ? '***set***' : '***missing***');
async function main() {
    const seller = "0x000000000000000000000000000000000000dead"; // Replace with a valid test address if needed
    const custodyAmount = "1000000"; // 1 MXNB (6 decimals)
    const custodyPeriod = 60; // 1 minute
    try {
        console.log('Calling createEscrow...');
        const result = await (0, escrowService_1.createEscrow)({ seller, custodyAmount, custodyPeriod });
        console.log("Escrow created:", result);
    }
    catch (err) {
        console.error("Error creating escrow:", err);
    }
}
main();
