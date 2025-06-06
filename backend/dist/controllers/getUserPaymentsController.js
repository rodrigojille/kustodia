"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPayments = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const getUserPayments = async (req, res) => {
    const authReq = req;
    try {
        // Restrict to authenticated user only
        // Assume req.user is populated by authentication middleware
        const authUser = authReq.user;
        if (!authUser || !authUser.id) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payments = await paymentRepo.find({
            where: [
                { user: { id: Number(authUser.id) } },
                { recipient_email: authUser.email },
                { payer_email: authUser.email }
            ],
            order: { created_at: "DESC" },
            relations: ["user", "escrow"]
        });
        res.json({ payments });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch payments", details: err instanceof Error ? err.message : err });
    }
};
exports.getUserPayments = getUserPayments;
