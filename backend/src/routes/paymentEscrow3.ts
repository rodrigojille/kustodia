import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { initiateEscrow3Payment } from "../controllers/paymentControllerEscrow3";
import { preflightEscrow3 } from "../controllers/preflightEscrow3Controller";

const router = Router();

// New endpoint for wallet-based escrow payments (Flow 2.0)
// Type assertion to 'any' to bypass Express handler signature issue with AuthenticatedRequest
router.post("/initiate-wallet", authenticateJWT, initiateEscrow3Payment as any);
router.post("/preflight-wallet", authenticateJWT, preflightEscrow3 as any);

export default router;
