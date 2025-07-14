"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const userController_1 = require("../controllers/userController");
const kycController_1 = require("../controllers/kycController");
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
router.get("/me", authenticateJWT_1.authenticateJWT, userController_1.getMe);
router.patch("/me", authenticateJWT_1.authenticateJWT, userController_1.updateMyProfile);
router.post("/change-password", authenticateJWT_1.authenticateJWT, userController_1.changePassword);
// Update user's payout CLABE
router.put("/me/payout-clabe", authenticateJWT_1.authenticateJWT, userController_1.updatePayoutClabe);
// KYC status endpoint
router.get("/kyc-status", kycController_1.getKYCStatus);
// Verify recipient email exists and is verified
router.post("/verify-recipient", userController_1.verifyRecipient);
// Get recipient deposit CLABE by email
router.post('/recipient-clabe', userController_1.getRecipientClabe);
exports.default = router;
