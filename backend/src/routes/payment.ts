import { Router, RequestHandler } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { initiatePayment, initiateWeb3Payment, junoWebhook, fundWeb3Escrow, releaseWeb3Payment } from '../controllers/paymentController';
import { getUserPayments } from "../controllers/getUserPaymentsController";
import { getPaymentEvents } from "../controllers/paymentEventController";
import { getPaymentById } from "../controllers/getPaymentByIdController";
import { requestPayment } from "../controllers/requestPaymentController";
// getAllPayments moved to admin routes for security
import { approvePaymentPayer, approvePaymentPayee } from "../controllers/paymentApprovalController";
import { createCobroPayment, getCobroPayment, approveCobroPayment, releaseCobroPayment } from "../controllers/cobroPaymentController";
const router = Router();

// SECURITY: Default payments endpoint now returns user-specific payments only
router.get("/", authenticateJWT, getUserPayments); 
router.post('/initiate-web3', authenticateJWT, initiateWeb3Payment as unknown as RequestHandler);
router.post("/initiate", authenticateJWT, initiatePayment as unknown as RequestHandler);
router.post("/request", authenticateJWT, requestPayment);
router.post("/webhook/juno", junoWebhook);
router.get("/user-payments", authenticateJWT, getUserPayments);
router.get("/:id/events", getPaymentEvents);
router.get("/:id", getPaymentById);
router.post("/:id/approve/payer", authenticateJWT, approvePaymentPayer as unknown as RequestHandler);
router.post("/:id/approve/payee", authenticateJWT, approvePaymentPayee as unknown as RequestHandler);

// Web3 escrow management routes
router.post("/fund-web3-escrow", authenticateJWT, fundWeb3Escrow as unknown as RequestHandler);
router.post("/release-web3-escrow", authenticateJWT, releaseWeb3Payment as unknown as RequestHandler);

// Cobro Inteligente routes
router.post("/cobro-inteligente", authenticateJWT, createCobroPayment as unknown as RequestHandler);
router.get("/cobro-inteligente/:id", authenticateJWT, getCobroPayment as unknown as RequestHandler);
router.post("/cobro-inteligente/:id/approve", authenticateJWT, approveCobroPayment as unknown as RequestHandler);
router.post("/cobro-inteligente/:id/release", authenticateJWT, releaseCobroPayment as unknown as RequestHandler);

export default router;
