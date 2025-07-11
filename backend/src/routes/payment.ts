import { Router, RequestHandler } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { initiateWeb3Payment, junoWebhook, fundWeb3Escrow, releaseWeb3Payment } from '../controllers/paymentController';
import { getUserPayments } from "../controllers/getUserPaymentsController";
import { getPaymentEvents } from "../controllers/paymentEventController";
import { getPaymentById } from "../controllers/getPaymentByIdController";
import { requestPayment } from "../controllers/requestPaymentController";
import { getAllPayments } from "../controllers/getAllPaymentsController";
import { approvePaymentPayer, approvePaymentPayee } from "../controllers/paymentApprovalController";
const router = Router();

router.get("/", getAllPayments); 
router.post('/initiate-web3', authenticateJWT, initiateWeb3Payment as unknown as RequestHandler);
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

export default router;
