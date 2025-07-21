"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const disputeMessageController_1 = require("../controllers/disputeMessageController");
const router = (0, express_1.Router)();
// All routes require JWT authentication
router.use(authenticateJWT_1.authenticateJWT);
// Get all messages for a dispute
router.get('/:disputeId/messages', disputeMessageController_1.getDisputeMessages);
// Add a new message to a dispute (with optional file attachment)
router.post('/:disputeId/messages', disputeMessageController_1.upload.single('attachment'), disputeMessageController_1.addDisputeMessage);
// Get detailed dispute information with messages
router.get('/:disputeId/details', disputeMessageController_1.getDisputeDetails);
exports.default = router;
