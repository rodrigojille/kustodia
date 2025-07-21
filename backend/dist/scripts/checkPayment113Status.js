"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function checkPayment113Status() {
    try {
        await ormconfig_1.default.initialize();
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({
            where: { id: 113 },
            relations: ['escrow', 'seller', 'user']
        });
        if (!payment) {
            console.log('Payment 113 not found');
            return;
        }
        console.log('Payment 113 Status:');
        console.log('  Payment Status:', payment.status);
        console.log('  Payment Type:', payment.payment_type);
        console.log('  Amount:', payment.amount);
        console.log('  Payer:', payment.payer_email);
        console.log('  Payee:', payment.recipient_email);
        console.log('  Payer Approval:', payment.payer_approval);
        console.log('  Payee Approval:', payment.payee_approval);
        if (payment.escrow) {
            console.log('\nEscrow Details:');
            console.log('  Escrow ID:', payment.escrow.id);
            console.log('  Smart Contract ID:', payment.escrow.smart_contract_escrow_id);
            console.log('  Escrow Status:', payment.escrow.status);
            console.log('  Custody End:', payment.escrow.custody_end);
            console.log('  Release Amount:', payment.escrow.release_amount);
            console.log('  Release TX Hash:', payment.escrow.release_tx_hash);
            console.log('  Blockchain TX Hash:', payment.escrow.blockchain_tx_hash);
        }
        else {
            console.log('\nNo escrow associated with this payment');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await ormconfig_1.default.destroy();
    }
}
checkPayment113Status();
