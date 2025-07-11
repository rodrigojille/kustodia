import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { verifyEmail, resendVerificationEmail, register, login, requestPasswordReset, resetPassword, getRecipientClabe, updateMyProfile, changePassword, verifyRecipient, savePortalShare, getPortalShare } from '../controllers/userController';
import { getKYCStatus } from "../controllers/kycController";

import ormconfig from "../ormconfig";
import { User } from "../entity/User";
import { AuthenticatedRequest } from '../AuthenticatedRequest';

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

// Get current user info


router.get("/me", authenticateJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user || !authReq.user.id) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = await ormconfig.getRepository(User).findOne({ where: { id: authReq.user.id } });
  if (!user) {
    res.status(404).json({ error: "No user found" });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, full_name: user.full_name, deposit_clabe: user.deposit_clabe, payout_clabe: user.payout_clabe, kyc_status: user.kyc_status, wallet_address: user.wallet_address } });
});

router.patch("/me", authenticateJWT, updateMyProfile);

router.post("/change-password", authenticateJWT, changePassword);
// Update payout CLABE
router.post("/update-payout-clabe", authenticateJWT, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const { payout_clabe } = req.body;
  if (!authReq.user || !authReq.user.id) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (!payout_clabe || typeof payout_clabe !== 'string' || payout_clabe.length !== 18) {
    res.status(400).json({ error: "CLABE inválida" });
    return;
  }
  
  const user = await ormconfig.getRepository(User).findOne({ where: { id: authReq.user.id } });
  if (!user) {
    res.status(404).json({ error: "No user found" });
    return;
  }

  try {
    // 🚀 IMMEDIATE JUNO REGISTRATION: Register CLABE with Juno and get UUID
    const { registerBankAccount } = await import('../services/junoService');
    const registrationResult = await registerBankAccount(payout_clabe, user.full_name || user.email);
    
    console.log('✅ CLABE registrada con Juno:', registrationResult);
    
    // Store both CLABE and Juno UUID
    user.payout_clabe = payout_clabe;
    user.juno_bank_account_id = registrationResult.id; // Store Juno UUID
    
    await ormconfig.getRepository(User).save(user);
    
    res.json({ 
      message: "CLABE guardada y registrada con Juno", 
      juno_account_id: registrationResult.id 
    });
  } catch (error: any) {
    console.error('❌ Error registrando CLABE con Juno:', error.message);
    res.status(400).json({ 
      error: "Error registrando CLABE con Juno: " + error.message 
    });
  }
});

// KYC status endpoint
router.get("/kyc-status", getKYCStatus);

// Verify recipient email exists and is verified
router.post("/verify-recipient", verifyRecipient);

// Get recipient deposit CLABE by email
router.post('/recipient-clabe', getRecipientClabe);

export default router;
