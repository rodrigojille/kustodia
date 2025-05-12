"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const kycController_1 = require("../controllers/kycController");
const verifyRecipientController_1 = require("../controllers/verifyRecipientController");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
// Demo: stub auth, always userId=1
const getUser = async () => {
    const repo = ormconfig_1.default.getRepository(User_1.User);
    return repo.findOne({ where: { id: 1 } });
};
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/verify-email", userController_1.verifyEmail);
router.post("/request-password-reset", userController_1.requestPasswordReset);
router.post("/reset-password", userController_1.resetPassword);
router.post("/resend-verification", userController_1.resendVerificationEmail);
// Get current user info
router.get("/me", async (req, res) => {
    const user = await getUser();
    if (!user) {
        res.status(404).json({ error: "No user found" });
        return;
    }
    res.json({ user: { id: user.id, email: user.email, clabe: user.clabe, kyc_status: user.kyc_status } });
});
// Update CLABE
router.post("/update-clabe", async (req, res) => {
    const { clabe } = req.body;
    if (!clabe || typeof clabe !== 'string' || clabe.length !== 18) {
        res.status(400).json({ error: "CLABE inválida" });
        return;
    }
    const user = await getUser();
    if (!user) {
        res.status(404).json({ error: "No user found" });
        return;
    }
    user.clabe = clabe;
    await ormconfig_1.default.getRepository(User_1.User).save(user);
    res.json({ message: "CLABE guardada" });
});
// KYC status endpoint
router.get("/kyc-status", kycController_1.getKYCStatus);
// Verify recipient email exists and is verified
router.post("/verify-recipient", verifyRecipientController_1.verifyRecipient);
exports.default = router;
