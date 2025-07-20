"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const paymentController_1 = require("../controllers/paymentController");
const getUserPaymentsController_1 = require("../controllers/getUserPaymentsController");
const paymentEventController_1 = require("../controllers/paymentEventController");
const getPaymentByIdController_1 = require("../controllers/getPaymentByIdController");
const requestPaymentController_1 = require("../controllers/requestPaymentController");
// getAllPayments moved to admin routes for security
const paymentApprovalController_1 = require("../controllers/paymentApprovalController");
const cobroPaymentController_1 = require("../controllers/cobroPaymentController");
const router = (0, express_1.Router)();
// SECURITY: Default payments endpoint now returns user-specific payments only
router.get("/", authenticateJWT_1.authenticateJWT, getUserPaymentsController_1.getUserPayments);
router.post('/initiate-web3', authenticateJWT_1.authenticateJWT, paymentController_1.initiateWeb3Payment);
router.post("/initiate", authenticateJWT_1.authenticateJWT, paymentController_1.initiatePayment);
router.post("/request", authenticateJWT_1.authenticateJWT, requestPaymentController_1.requestPayment);
router.post("/webhook/juno", paymentController_1.junoWebhook);
router.get("/user-payments", authenticateJWT_1.authenticateJWT, getUserPaymentsController_1.getUserPayments);
router.get("/:id/events", paymentEventController_1.getPaymentEvents);
router.get("/:id", getPaymentByIdController_1.getPaymentById);
router.post("/:id/approve/payer", authenticateJWT_1.authenticateJWT, paymentApprovalController_1.approvePaymentPayer);
router.post("/:id/approve/payee", authenticateJWT_1.authenticateJWT, paymentApprovalController_1.approvePaymentPayee);
// Web3 escrow management routes
router.post("/fund-web3-escrow", authenticateJWT_1.authenticateJWT, paymentController_1.fundWeb3Escrow);
router.post("/release-web3-escrow", authenticateJWT_1.authenticateJWT, paymentController_1.releaseWeb3Payment);
// Cobro Inteligente routes
router.post("/cobro-inteligente", authenticateJWT_1.authenticateJWT, cobroPaymentController_1.createCobroPayment);
router.get("/cobro-inteligente/:id", authenticateJWT_1.authenticateJWT, cobroPaymentController_1.getCobroPayment);
router.post("/cobro-inteligente/:id/approve", authenticateJWT_1.authenticateJWT, cobroPaymentController_1.approveCobroPayment);
router.post("/cobro-inteligente/:id/release", authenticateJWT_1.authenticateJWT, cobroPaymentController_1.releaseCobroPayment);
exports.default = router;
