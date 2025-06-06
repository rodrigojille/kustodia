import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { acceptPaymentRequest, rejectPaymentRequest } from "../controllers/acceptPaymentRequestController";

const router = Router();

// Accept a payment request (payer only)
router.post("/:id/accept", authenticateJWT, acceptPaymentRequest);
// Reject a payment request (payer only)
router.post("/:id/reject", authenticateJWT, rejectPaymentRequest);

export default router;
