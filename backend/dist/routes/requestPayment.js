"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const acceptPaymentRequestController_1 = require("../controllers/acceptPaymentRequestController");
const router = (0, express_1.Router)();
// Accept a payment request (payer only)
router.post("/:id/accept", authenticateJWT_1.authenticateJWT, acceptPaymentRequestController_1.acceptPaymentRequest);
// Reject a payment request (payer only)
router.post("/:id/reject", authenticateJWT_1.authenticateJWT, acceptPaymentRequestController_1.rejectPaymentRequest);
exports.default = router;
