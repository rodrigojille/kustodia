"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const userController_1 = require("../controllers/userController");
const kycController_1 = require("../controllers/kycController");
const verifyRecipientController_1 = require("../controllers/verifyRecipientController");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/verify-email", userController_1.verifyEmail);
router.post("/request-password-reset", userController_1.requestPasswordReset);
router.post("/reset-password", userController_1.resetPassword);
router.post("/resend-verification", userController_1.resendVerificationEmail);
// Get current user info
router.get("/me", authenticateJWT_1.authenticateJWT, async (req, res) => {
    const authReq = req;
    if (!authReq.user || !authReq.user.id) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    const user = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { id: authReq.user.id } });
    if (!user) {
        res.status(404).json({ error: "No user found" });
        return;
    }
    res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe, kyc_status: user.kyc_status, wallet_address: user.wallet_address } });
});
router.patch("/me", authenticateJWT_1.authenticateJWT, userController_1.updateMyProfile);
router.post("/change-password", authenticateJWT_1.authenticateJWT, userController_1.changePassword);
// Update payout CLABE
router.post("/update-payout-clabe", authenticateJWT_1.authenticateJWT, async (req, res) => {
    const authReq = req;
    const { payout_clabe } = req.body;
    if (!authReq.user || !authReq.user.id) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    if (!payout_clabe || typeof payout_clabe !== 'string' || payout_clabe.length !== 18) {
        res.status(400).json({ error: "CLABE inválida" });
        return;
    }
    const user = await ormconfig_1.default.getRepository(User_1.User).findOne({ where: { id: authReq.user.id } });
    if (!user) {
        res.status(404).json({ error: "No user found" });
        return;
    }
    user.payout_clabe = payout_clabe;
    await ormconfig_1.default.getRepository(User_1.User).save(user);
    res.json({ message: "Payout CLABE guardada" });
});
// KYC status endpoint
router.get("/kyc-status", kycController_1.getKYCStatus);
// Verify recipient email exists and is verified
router.post("/verify-recipient", verifyRecipientController_1.verifyRecipient);
// Get recipient deposit CLABE by email
router.post('/recipient-clabe', userController_1.getRecipientClabe);
exports.default = router;
