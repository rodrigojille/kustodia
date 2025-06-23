import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { initiatePayment, junoWebhook } from "../controllers/paymentController";
import { getUserPayments } from "../controllers/getUserPaymentsController";
import { getPaymentEvents } from "../controllers/paymentEventController";
import { getPaymentById } from "../controllers/getPaymentByIdController";
import { requestPayment } from "../controllers/requestPaymentController";
import { getAllPayments } from "../controllers/getAllPaymentsController";
const router = Router();

router.get("/", getAllPayments); 
router.post("/initiate", initiatePayment);
router.post("/request", authenticateJWT, requestPayment);
router.post("/webhook/juno", junoWebhook);
router.get("/user-payments", authenticateJWT, getUserPayments);
router.get("/:id/events", getPaymentEvents);
router.get("/:id", getPaymentById);

export default router;
