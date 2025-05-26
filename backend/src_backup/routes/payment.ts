import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { initiatePayment, junoWebhook } from "../controllers/paymentController";
import { getUserPayments } from "../controllers/getUserPaymentsController";

import { getPaymentById } from "../controllers/getPaymentByIdController";
const router = Router();

router.post("/initiate", initiatePayment);
router.post("/webhook/juno", junoWebhook);
router.get("/user-payments", authenticateJWT, getUserPayments);
router.get("/:id", getPaymentById);

export default router;
