"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRecipient = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const verifyRecipient = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
    }
    try {
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            res.json({ exists: false, verified: false });
            return;
        }
        res.json({ exists: true, verified: !!user.email_verified });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Verification failed", details: err instanceof Error ? err.message : err });
        return;
    }
};
exports.verifyRecipient = verifyRecipient;
