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
const adminController_1 = require("../controllers/adminController");
const ticketController_1 = require("../controllers/ticketController");
const router = (0, express_1.Router)();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// =============================================================================
// 🚨 LEGACY ADMIN ROUTES (Preserved for backward compatibility)
// =============================================================================
// Dispute management
router.get("/disputes", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getAllDisputes));
// User management
router.get("/users", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getAllUsersWithDetails));
router.get("/users/:userId/clabes", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getUserClabes));
router.get("/users/:userId/deposits", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getUserDeposits));
// Transaction/escrow management
router.get("/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getAllPayments));
// Support tickets
router.get("/tickets", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(ticketController_1.getTicketsForAdmin));
// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM ROUTES
// =============================================================================
// 📊 Analytics Dashboard
router.get("/analytics/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getPaymentAnalytics));
router.get("/analytics/users", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getUserAnalytics));
// 🔍 Advanced Search & Troubleshooting
router.get("/payments/search", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.searchPayments));
router.get("/health/payments", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getPaymentHealth));
// 🔧 Operations & Fixes
router.post("/operations/bulk-fix-uuids", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.bulkFixMissingUUIDs));
// 🏦 External API Monitoring
router.get("/monitoring/juno-status", authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, asyncHandler(adminController_1.getJunoApiStatus));
// 🎮 System Status & Operations Center
router.use("/system", systemStatus_1.default);
router.use("/system", systemLogs_1.default);
// 📊 Heroku Platform Logs & Monitoring
router.use("/heroku", herokuLogs_1.default);
// 📋 Unified Logs Endpoint (Auto-detects Environment)
router.use("/", logs_1.default);
exports.default = router;
