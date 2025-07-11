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
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const userController_1 = require("../controllers/userController");
const kycController_1 = require("../controllers/kycController");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
router.post("/register", userController_1.register);
router.post("/verify-recipient", userController_1.verifyRecipient);
router.post("/login", userController_1.login);
router.post("/verify-email", userController_1.verifyEmail);
router.post("/request-password-reset", userController_1.requestPasswordReset);
router.post("/reset-password", userController_1.resetPassword);
router.post("/resend-verification", userController_1.resendVerificationEmail);
// Save the user's portal share after creation/recovery
router.post('/save-portal-share', authenticateJWT_1.authenticateJWT, userController_1.savePortalShare);
// Get the user's portal share for recovery
router.get('/get-portal-share', authenticateJWT_1.authenticateJWT, userController_1.getPortalShare);
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
    try {
        // 🚀 IMMEDIATE JUNO REGISTRATION: Register CLABE with Juno and get UUID
        const { registerBankAccount } = await Promise.resolve().then(() => __importStar(require('../services/junoService')));
        const registrationResult = await registerBankAccount(payout_clabe, user.full_name || user.email);
        console.log('✅ CLABE registrada con Juno:', registrationResult);
        // Store both CLABE and Juno UUID
        user.payout_clabe = payout_clabe;
        user.juno_bank_account_id = registrationResult.id; // Store Juno UUID
        await ormconfig_1.default.getRepository(User_1.User).save(user);
        res.json({
            message: "CLABE guardada y registrada con Juno",
            juno_account_id: registrationResult.id
        });
    }
    catch (error) {
        console.error('❌ Error registrando CLABE con Juno:', error.message);
        res.status(400).json({
            error: "Error registrando CLABE con Juno: " + error.message
        });
    }
});
// KYC status endpoint
router.get("/kyc-status", kycController_1.getKYCStatus);
// Verify recipient email exists and is verified
router.post("/verify-recipient", userController_1.verifyRecipient);
// Get recipient deposit CLABE by email
router.post('/recipient-clabe', userController_1.getRecipientClabe);
exports.default = router;
