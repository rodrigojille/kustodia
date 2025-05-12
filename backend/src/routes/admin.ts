import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { getAllDisputes, getAllUsersWithDetails, getAllPayments, getUserClabes, getUserDeposits } from "../controllers/adminController";

const router = Router();

function asyncHandler(fn: any) {
  return function(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Dispute management
router.get("/disputes", authenticateJWT, asyncHandler(getAllDisputes));
// User management
router.get("/users", authenticateJWT, asyncHandler(getAllUsersWithDetails));
router.get("/users/:userId/clabes", authenticateJWT, asyncHandler(getUserClabes));
router.get("/users/:userId/deposits", authenticateJWT, asyncHandler(getUserDeposits));
// Transaction/escrow management
router.get("/payments", authenticateJWT, asyncHandler(getAllPayments));

export default router;
