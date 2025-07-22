import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { requireAdminRole } from '../middleware/requireAdminRole';
import { raiseDispute, getDisputeTimeline, adminResolveDispute, getUserDisputes, getDisputeRiskAssessment, getBatchDisputeRiskAssessments } from "../controllers/disputeController";
import { Dispute } from '../entity/Dispute';

const router = Router();

// Async handler wrapper for Express
function asyncHandler(fn: any) {
  return function(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Get user's disputes list
router.get("/", authenticateJWT, asyncHandler(getUserDisputes));
// User raises or reapplies for dispute
router.post("/:escrowId/raise", authenticateJWT, asyncHandler(raiseDispute));
// Get dispute timeline/tracking
router.get("/:escrowId/timeline", authenticateJWT, asyncHandler(getDisputeTimeline));
// Admin resolves dispute
router.post("/:escrowId/admin-resolve", authenticateJWT, asyncHandler(adminResolveDispute));
// Get AI risk assessment for a dispute (admin only)
router.get("/ai-assessment/:disputeId", authenticateJWT, requireAdminRole, asyncHandler(getDisputeRiskAssessment));
// Get batch AI risk assessments (admin only) - FIXED: Removed asyncHandler to fix JWT auth
router.post("/ai-assessment/batch", authenticateJWT, requireAdminRole, async (req: any, res: any, next: any) => {
  try {
    await getBatchDisputeRiskAssessments(req, res);
  } catch (error) {
    next(error);
  }
});

// DEBUG: Test authentication in dispute router WITHOUT asyncHandler
router.get('/debug-auth', authenticateJWT, requireAdminRole, async (req: any, res: any) => {
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

export default router;
