"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKYCStatus = getKYCStatus;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
// GET /api/user/kyc-status?process_id=...
async function getKYCStatus(req, res) {
    const { process_id } = req.query;
    if (!process_id) {
        res.status(400).json({ error: "process_id is required" });
        return;
    }
    const user = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { truora_process_id: String(process_id) } });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json({ kyc_status: user.kyc_status, user });
}
