"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('--- Script execution started ---');
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const junoService_1 = require("../services/junoService");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
async function main() {
    const destinationAddress = process.env.BRIDGE_WALLET_ADDRESS;
    const amount = parseFloat(process.env.WITHDRAW_AMOUNT || '2000');
    if (!destinationAddress) {
        throw new Error('Falta BRIDGE_WALLET_ADDRESS en .env');
    }
    console.log(`Iniciando withdrawal de ${amount} MXNB to ${destinationAddress}`);
    await (0, junoService_1.withdrawCryptoToBridgeWallet)(amount, destinationAddress);
}
(async () => {
    try {
        await main();
        console.log('\nScript finished successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('\n--- SCRIPT FAILED ---');
        console.error('An error was caught by the execution wrapper:', error);
        process.exit(1);
    }
})();
