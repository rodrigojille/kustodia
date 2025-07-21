"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const disputeController_1 = require("../controllers/disputeController");
const router = (0, express_1.Router)();
// Async handler wrapper for Express
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Get user's disputes list
router.get("/", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.getUserDisputes));
// User raises or reapplies for dispute
router.post("/:escrowId/raise", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.raiseDispute));
// Get dispute timeline/tracking
router.get("/:escrowId/timeline", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.getDisputeTimeline));
// Admin resolves dispute
router.post("/:escrowId/admin-resolve", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.adminResolveDispute));
// Get AI risk assessment for a dispute (admin only)
router.get("/ai-assessment/:disputeId", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.getDisputeRiskAssessment));
// Get batch AI risk assessments (admin only)
router.post("/ai-assessment/batch", authenticateJWT_1.authenticateJWT, asyncHandler(disputeController_1.getBatchDisputeRiskAssessments));
exports.default = router;
