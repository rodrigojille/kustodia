"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const paymentControllerEscrow3_1 = require("../controllers/paymentControllerEscrow3");
const preflightEscrow3Controller_1 = require("../controllers/preflightEscrow3Controller");
const router = (0, express_1.Router)();
// New endpoint for wallet-based escrow payments (Flow 2.0)
// Type assertion to 'any' to bypass Express handler signature issue with AuthenticatedRequest
router.post("/initiate-wallet", authenticateJWT_1.authenticateJWT, paymentControllerEscrow3_1.initiateEscrow3Payment);
router.post("/preflight-wallet", authenticateJWT_1.authenticateJWT, preflightEscrow3Controller_1.preflightEscrow3);
exports.default = router;
