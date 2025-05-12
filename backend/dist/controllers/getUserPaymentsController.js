"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPayments = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const getUserPayments = async (req, res) => {
    try {
        const { user_id, email } = req.query;
        if (!user_id && !email) {
            res.status(400).json({ error: "Missing user_id or email" });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        let payments = [];
        if (user_id) {
            payments = await paymentRepo.find({
                where: { user: { id: Number(user_id) } },
                order: { created_at: "DESC" },
                relations: ["user", "escrow"]
            });
        }
        else if (email) {
            payments = await paymentRepo.find({
                where: { recipient_email: String(email) },
                order: { created_at: "DESC" },
                relations: ["user", "escrow"]
            });
        }
        res.json({ payments });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch payments", details: err instanceof Error ? err.message : err });
    }
};
exports.getUserPayments = getUserPayments;
