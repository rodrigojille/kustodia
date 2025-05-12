import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { raiseDispute, getDisputeTimeline, adminResolveDispute } from "../controllers/disputeController";
import { Dispute } from '../entity/Dispute';

const router = Router();

// Async handler wrapper for Express
function asyncHandler(fn: any) {
  return function(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// User raises or reapplies for dispute
router.post("/:escrowId/raise", authenticateJWT, asyncHandler(raiseDispute));
// Get dispute timeline/tracking
router.get("/:escrowId/timeline", authenticateJWT, asyncHandler(getDisputeTimeline));
// Admin resolves dispute
router.post("/:escrowId/admin-resolve", authenticateJWT, asyncHandler(adminResolveDispute));

export default router;
