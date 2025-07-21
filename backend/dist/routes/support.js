"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supportController_1 = require("../controllers/supportController");
const authenticateJWT_1 = require("../authenticateJWT");
const router = (0, express_1.Router)();
router.post('/chat', authenticateJWT_1.authenticateJWT, supportController_1.handleChatMessage);
exports.default = router;
