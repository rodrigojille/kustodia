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
        const payment = await paymentRepo.findOne({ where: { id: Number(id) }, relations: ["user", "escrow"] });
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }
        res.json({ payment });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch payment", details: err instanceof Error ? err.message : err });
    }
};
exports.getPaymentById = getPaymentById;
