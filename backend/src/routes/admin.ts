import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import systemStatusRouter from './admin/systemStatus';
import { 
  // Legacy functions
  getAllDisputes, 
  getAllUsersWithDetails, 
  getAllPayments, 
  getUserClabes, 
  getUserDeposits,
  // New Control Room functions
  getPaymentAnalytics,
  searchPayments,
  getPaymentHealth,
  bulkFixMissingUUIDs,
  getJunoApiStatus,
  getUserAnalytics
} from "../controllers/adminController";
import { getTicketsForAdmin } from "../controllers/ticketController";

const router = Router();

function asyncHandler(fn: any) {
  return function(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// =============================================================================
// 🚨 LEGACY ADMIN ROUTES (Preserved for backward compatibility)
// =============================================================================

// Dispute management
router.get("/disputes", authenticateJWT, asyncHandler(getAllDisputes));
// User management
router.get("/users", authenticateJWT, asyncHandler(getAllUsersWithDetails));
router.get("/users/:userId/clabes", authenticateJWT, asyncHandler(getUserClabes));
router.get("/users/:userId/deposits", authenticateJWT, asyncHandler(getUserDeposits));
// Transaction/escrow management
router.get("/payments", authenticateJWT, asyncHandler(getAllPayments));
// Support tickets
router.get("/tickets", authenticateJWT, asyncHandler(getTicketsForAdmin));

// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM ROUTES
// =============================================================================

// 📊 Analytics Dashboard
router.get("/analytics/payments", authenticateJWT, asyncHandler(getPaymentAnalytics));
router.get("/analytics/users", authenticateJWT, asyncHandler(getUserAnalytics));

// 🔍 Advanced Search & Troubleshooting
router.get("/payments/search", authenticateJWT, asyncHandler(searchPayments));
router.get("/health/payments", authenticateJWT, asyncHandler(getPaymentHealth));

// 🔧 Operations & Fixes
router.post("/operations/bulk-fix-uuids", authenticateJWT, asyncHandler(bulkFixMissingUUIDs));

// 🏦 External API Monitoring
router.get("/monitoring/juno-status", authenticateJWT, asyncHandler(getJunoApiStatus));

// 🎮 System Status & Operations Center
router.use("/system", systemStatusRouter);

export default router;
