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
// Get batch AI risk assessments (admin only)
router.post("/ai-assessment/batch", authenticateJWT, requireAdminRole, asyncHandler(getBatchDisputeRiskAssessments));

export default router;
