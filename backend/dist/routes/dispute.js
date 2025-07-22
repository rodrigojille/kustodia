"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const requireAdminRole_1 = require("../middleware/requireAdminRole");
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
router.get("/ai-assessment/:disputeId", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(disputeController_1.getDisputeRiskAssessment));
// Get batch AI risk assessments (admin only) - FIXED: Removed asyncHandler to fix JWT auth
router.post("/ai-assessment/batch", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, disputeController_1.getBatchDisputeRiskAssessments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// DEBUG: Test authentication in dispute router WITHOUT asyncHandler
router.get('/debug-auth', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        message: 'Dispute router authentication working (no asyncHandler)',
        user: {
            id: user?.id,
            email: user?.email,
            role: user?.role
        },
        timestamp: new Date().toISOString()
    });
});
// DEBUG: Test POST authentication in dispute router
router.post('/debug-auth-post', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        message: 'Dispute router POST authentication working',
        user: {
            id: user?.id,
            email: user?.email,
            role: user?.role
        },
        body: req.body,
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
