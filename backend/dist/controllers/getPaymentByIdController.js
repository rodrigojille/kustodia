"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentById = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Missing payment id" });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const userRepo = ormconfig_1.default.getRepository(require("../entity/User").User);
        const payment = await paymentRepo.findOne({ where: { id: Number(id) }, relations: ["user", "escrow"] });
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }
        // Look up recipient by recipient_email
        let recipient_deposit_clabe = undefined;
        let recipient_full_name = undefined;
        if (payment.recipient_email) {
            const recipient = await userRepo.findOne({ where: { email: payment.recipient_email } });
            if (recipient) {
                recipient_deposit_clabe = recipient.deposit_clabe;
                recipient_full_name = recipient.full_name;
            }
        }
        res.json({
            payment: {
                ...payment,
                recipient_deposit_clabe,
                recipient_full_name
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch payment", details: err instanceof Error ? err.message : err });
    }
};
exports.getPaymentById = getPaymentById;
