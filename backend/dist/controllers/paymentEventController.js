"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentEvents = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const PaymentEvent_1 = require("../entity/PaymentEvent");
const getPaymentEvents = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: "Missing payment id" });
            return;
        }
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent); // Usar solo una vez por request
        const events = await paymentEventRepo.find({
            where: { paymentId: Number(id) },
            order: { created_at: "ASC" }
        });
        res.json({ events });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch payment events", details: err instanceof Error ? err.message : err });
    }
};
exports.getPaymentEvents = getPaymentEvents;
