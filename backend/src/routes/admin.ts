import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { requireAdminRole } from '../middleware/requireAdminRole';
import systemStatusRouter from './admin/systemStatus';
import herokuLogsRouter from './admin/herokuLogs';
import systemLogsRouter from './admin/systemLogs';
import unifiedLogsRouter from './admin/logs';
import simpleLogsRouter from './admin/logs-simple'; // Simple logs without Heroku API
import herokuDebugRouter from './admin/heroku-debug'; // Heroku API debugging
import debugAuthRouter from './admin/debug-auth'; // Authentication debugging
import analyticsRouter from './analytics'; // Analytics dashboard routes
import { getTicketById, getTicketsForAdmin, createReply, closeTicket } from '../controllers/ticketController';
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
  getUserAnalytics,
  getBridgeWalletBalance
} from "../controllers/adminController";


const router = Router();

// asyncHandler removed - using direct async functions to fix JWT authentication issues

// =============================================================================
// 🚨 LEGACY ADMIN ROUTES (Preserved for backward compatibility)
// =============================================================================

// Dispute management
router.get("/disputes", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getAllDisputes(req, res);
  } catch (error) {
    next(error);
  }
});
// User management
router.get("/users", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getAllUsersWithDetails(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/users/:userId/clabes", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getUserClabes(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/users/:userId/deposits", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getUserDeposits(req, res);
  } catch (error) {
    next(error);
  }
});
// Transaction/escrow management
router.get("/payments", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getAllPayments(req, res);
  } catch (error) {
    next(error);
  }
});
// Support tickets
router.get("/tickets", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getTicketsForAdmin(req, res);
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM ROUTES
// =============================================================================

// 📊 Analytics Dashboard
router.get("/analytics/payments", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getPaymentAnalytics(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/analytics/users", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getUserAnalytics(req, res);
  } catch (error) {
    next(error);
  }
});

// 🔍 Advanced Search & Troubleshooting
router.get("/payments/search", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await searchPayments(req, res);
  } catch (error) {
    next(error);
  }
});
router.get("/health/payments", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getPaymentHealth(req, res);
  } catch (error) {
    next(error);
  }
});

// 🔧 Operations & Fixes
router.post("/operations/bulk-fix-uuids", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await bulkFixMissingUUIDs(req, res);
  } catch (error) {
    next(error);
  }
});

// 🏦 External API Monitoring
router.get("/monitoring/juno-status", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getJunoApiStatus(req, res);
  } catch (error) {
    next(error);
  }
});

// 🎮 System Status & Operations Center
// Use system routers
router.use("/system", systemStatusRouter); // Main system status routes (/overview, /activity)
router.use("/logs", simpleLogsRouter); // Simple logs for production - matches /api/admin/logs
router.use("/dynos", herokuLogsRouter); // Heroku dynos endpoint - matches /api/admin/dynos
router.use("/system-logs", systemLogsRouter); // Enhanced system logs with filtering
router.use("/heroku", herokuLogsRouter);
router.use("/heroku-debug", herokuDebugRouter); // Debug Heroku API issues

// 📋 Unified Logs Endpoint (Auto-detects Environment)
router.use("/logs-unified", unifiedLogsRouter); // Move to different path

// 🐛 Debug Authentication Issues
router.use("/debug-auth", debugAuthRouter); // Authentication debugging

// 📊 Analytics Dashboard Routes
router.use("/analytics", analyticsRouter); // Analytics dashboard endpoints

// 🎫 Admin Ticket Management
// @route   GET /api/admin/tickets
// @desc    Get all tickets for admin
// @access  Private (admin)
router.get("/tickets", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getTicketsForAdmin(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/tickets/:id
// @desc    Get individual ticket details for admin
// @access  Private (admin)
router.get("/tickets/:id", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getTicketById(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/tickets/:id/reply
// @desc    Admin reply to ticket
// @access  Private (admin)
router.post("/tickets/:id/reply", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await createReply(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/tickets/:id/close
// @desc    Admin close ticket
// @access  Private (admin)
router.patch("/tickets/:id/close", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await closeTicket(req, res);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/bridge-wallet-balance
// @desc    Get MXNB balance of bridge wallet
// @access  Private (admin)
router.get("/bridge-wallet-balance", authenticateJWT, requireAdminRole, async (req, res, next) => {
  try {
    await getBridgeWalletBalance(req, res);
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// 📊 CUSTOMER ANALYTICS DASHBOARD API ENDPOINTS
// =============================================================================



export default router;
