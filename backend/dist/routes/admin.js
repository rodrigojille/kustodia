"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const requireAdminRole_1 = require("../middleware/requireAdminRole");
const systemStatus_1 = __importDefault(require("./admin/systemStatus"));
const herokuLogs_1 = __importDefault(require("./admin/herokuLogs"));
const systemLogs_1 = __importDefault(require("./admin/systemLogs"));
const logs_1 = __importDefault(require("./admin/logs"));
const logs_simple_1 = __importDefault(require("./admin/logs-simple")); // Simple logs without Heroku API
const heroku_debug_1 = __importDefault(require("./admin/heroku-debug")); // Heroku API debugging
const debug_auth_1 = __importDefault(require("./admin/debug-auth")); // Authentication debugging
const ticketController_1 = require("../controllers/ticketController");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// asyncHandler removed - using direct async functions to fix JWT authentication issues
// =============================================================================
// 🚨 LEGACY ADMIN ROUTES (Preserved for backward compatibility)
// =============================================================================
// Dispute management
router.get("/disputes", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getAllDisputes)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// User management
router.get("/users", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getAllUsersWithDetails)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get("/users/:userId/clabes", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getUserClabes)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get("/users/:userId/deposits", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getUserDeposits)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Transaction/escrow management
router.get("/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getAllPayments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Support tickets
router.get("/tickets", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, ticketController_1.getTicketsForAdmin)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM ROUTES
// =============================================================================
// 📊 Analytics Dashboard
router.get("/analytics/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getPaymentAnalytics)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get("/analytics/users", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getUserAnalytics)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// 🔍 Advanced Search & Troubleshooting
router.get("/payments/search", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.searchPayments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get("/health/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getPaymentHealth)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// 🔧 Operations & Fixes
router.post("/operations/bulk-fix-uuids", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.bulkFixMissingUUIDs)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// 🏦 External API Monitoring
router.get("/monitoring/juno-status", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getJunoApiStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// 🎮 System Status & Operations Center
// Use system routers
router.use("/system", systemStatus_1.default); // Main system status routes (/overview, /activity)
router.use("/logs", logs_simple_1.default); // Simple logs for production - matches /api/admin/logs
router.use("/dynos", herokuLogs_1.default); // Heroku dynos endpoint - matches /api/admin/dynos
router.use("/system-logs", systemLogs_1.default); // Enhanced system logs with filtering
router.use("/heroku", herokuLogs_1.default);
router.use("/heroku-debug", heroku_debug_1.default); // Debug Heroku API issues
// 📋 Unified Logs Endpoint (Auto-detects Environment)
router.use("/logs-unified", logs_1.default); // Move to different path
// 🐛 Debug Authentication Issues
router.use("/debug-auth", debug_auth_1.default); // Authentication debugging
// 🎫 Admin Ticket Management
// @route   GET /api/admin/tickets
// @desc    Get all tickets for admin
// @access  Private (admin)
router.get("/tickets", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, ticketController_1.getTicketsForAdmin)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/admin/tickets/:id
// @desc    Get individual ticket details for admin
// @access  Private (admin)
router.get("/tickets/:id", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, ticketController_1.getTicketById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// @route   POST /api/admin/tickets/:id/reply
// @desc    Admin reply to ticket
// @access  Private (admin)
router.post("/tickets/:id/reply", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, ticketController_1.createReply)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// @route   PATCH /api/admin/tickets/:id/close
// @desc    Admin close ticket
// @access  Private (admin)
router.patch("/tickets/:id/close", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, ticketController_1.closeTicket)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/admin/bridge-wallet-balance
// @desc    Get MXNB balance of bridge wallet
// @access  Private (admin)
router.get("/bridge-wallet-balance", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res, next) => {
    try {
        await (0, adminController_1.getBridgeWalletBalance)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
