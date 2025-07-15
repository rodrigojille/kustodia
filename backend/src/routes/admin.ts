import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { requireAdminRole } from '../middleware/requireAdminRole';
import systemStatusRouter from './admin/systemStatus';
import herokuLogsRouter from './admin/herokuLogs';
import systemLogsRouter from './admin/systemLogs';
import unifiedLogsRouter from './admin/logs';
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
router.get("/disputes", authenticateJWT, requireAdminRole, asyncHandler(getAllDisputes));
// User management
router.get("/users", authenticateJWT, requireAdminRole, asyncHandler(getAllUsersWithDetails));
router.get("/users/:userId/clabes", authenticateJWT, requireAdminRole, asyncHandler(getUserClabes));
router.get("/users/:userId/deposits", authenticateJWT, requireAdminRole, asyncHandler(getUserDeposits));
// Transaction/escrow management
router.get("/payments", authenticateJWT, requireAdminRole, asyncHandler(getAllPayments));
// Support tickets
router.get("/tickets", authenticateJWT, requireAdminRole, asyncHandler(getTicketsForAdmin));

// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM ROUTES
// =============================================================================

// 📊 Analytics Dashboard
router.get("/analytics/payments", authenticateJWT, requireAdminRole, asyncHandler(getPaymentAnalytics));
router.get("/analytics/users", authenticateJWT, requireAdminRole, asyncHandler(getUserAnalytics));

// 🔍 Advanced Search & Troubleshooting
router.get("/payments/search", authenticateJWT, requireAdminRole, asyncHandler(searchPayments));
router.get("/health/payments", authenticateJWT, requireAdminRole, asyncHandler(getPaymentHealth));

// 🔧 Operations & Fixes
router.post("/operations/bulk-fix-uuids", authenticateJWT, requireAdminRole, asyncHandler(bulkFixMissingUUIDs));

// 🏦 External API Monitoring
router.get("/monitoring/juno-status", authenticateJWT, requireAdminRole, asyncHandler(getJunoApiStatus));

// 🎮 System Status & Operations Center
router.use("/system", systemStatusRouter);
router.use("/system", systemLogsRouter);

// 📊 Heroku Platform Logs & Monitoring
router.use("/heroku", herokuLogsRouter);

// 📋 Unified Logs Endpoint (Auto-detects Environment)
router.use("/", unifiedLogsRouter);

export default router;
