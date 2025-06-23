import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { register, login, verifyEmail, requestPasswordReset, resetPassword, resendVerificationEmail, getRecipientClabe } from "../controllers/userController";
import { getKYCStatus } from "../controllers/kycController";
import { verifyRecipient } from "../controllers/verifyRecipientController";
import ormconfig from "../ormconfig";
import { User } from "../entity/User";
import { AuthenticatedRequest } from '../AuthenticatedRequest';

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/resend-verification", resendVerificationEmail);

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
  user.payout_clabe = payout_clabe;
  await ormconfig.getRepository(User).save(user);
  res.json({ message: "Payout CLABE guardada" });
});

// KYC status endpoint
router.get("/kyc-status", getKYCStatus);

// Verify recipient email exists and is verified
router.post("/verify-recipient", verifyRecipient);

// Get recipient deposit CLABE by email
router.post('/recipient-clabe', getRecipientClabe);

export default router;
