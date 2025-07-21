"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const authenticateJWT_1 = require("../authenticateJWT");
const router = (0, express_1.Router)();
// @route   POST /api/wallet/generate-deposit-clabe
// @desc    Generate a unique CLABE for a user to deposit funds
// @access  Private
router.post('/generate-deposit-clabe', authenticateJWT_1.authenticateJWT, async (req, res) => {
    await (0, walletController_1.generateDepositClabe)(req, res);
});
router.post('/initiate-withdrawal', authenticateJWT_1.authenticateJWT, async (req, res) => {
    await (0, walletController_1.initiateWithdrawal)(req, res);
});
exports.default = router;
