import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { verifyEmail, resendVerificationEmail, register, login, requestPasswordReset, resetPassword, getRecipientClabe, updateMyProfile, changePassword, verifyRecipient, savePortalShare, getPortalShare, getMe, updatePayoutClabe, retryWalletCreation } from '../controllers/userController';
import { getKYCStatus } from "../controllers/kycController";

import ormconfig from "../ormconfig";
import { User } from "../entity/User";

const router = Router();


router.post("/register", register);
router.post("/verify-recipient", verifyRecipient);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resend-verification", resendVerificationEmail);

// Save the user's portal share after creation/recovery
router.post('/save-portal-share', authenticateJWT, savePortalShare);

// Get the user's portal share for recovery
router.get('/get-portal-share', authenticateJWT, getPortalShare);

// Retry wallet creation for users without wallet
router.post('/retry-wallet', authenticateJWT, retryWalletCreation);

// Get current user info


router.get("/me", authenticateJWT, getMe);

router.patch("/me", authenticateJWT, updateMyProfile);

router.post("/change-password", authenticateJWT, changePassword);
// Update user's payout CLABE
router.put("/me/payout-clabe", authenticateJWT, updatePayoutClabe);

// KYC status endpoint
router.get("/kyc-status", getKYCStatus);

// Verify recipient email exists and is verified
router.post("/verify-recipient", verifyRecipient);

// Get recipient deposit CLABE by email
router.post('/recipient-clabe', getRecipientClabe);

export default router;
