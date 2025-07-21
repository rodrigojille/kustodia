"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const junoTransactionController_1 = require("../controllers/junoTransactionController");
const router = (0, express_1.Router)();
// Get Juno transaction details by transaction_id
router.post('/transaction/:transaction_id', junoTransactionController_1.getJunoTxDetails);
exports.default = router;
