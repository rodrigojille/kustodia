#!/usr/bin/env node

/**
 * PRODUCTION AUTH HOTFIX DEPLOYMENT SCRIPT
 * Applies authentication fixes to resolve 401 errors
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 DEPLOYING AUTHENTICATION HOTFIX');
console.log('=' .repeat(50));

// Step 1: Update admin routes to use debug routes temporarily
const adminRoutesFix = `
import { Router } from "express";
import { authenticateJWT } from '../authenticateJWT';
import { requireAdminRole } from '../middleware/requireAdminRole';
import systemStatusRouter from './admin/systemStatus';
import systemStatusDebugRouter from './admin/systemStatus-debug'; // Debug version
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

// 🎮 System Status & Operations Center - USE DEBUG VERSION
router.use("/system", systemStatusDebugRouter);
router.use("/system-original", systemStatusRouter); // Keep original as backup
router.use("/system", systemLogsRouter);

// 📊 Heroku Platform Logs & Monitoring
router.use("/heroku", herokuLogsRouter);

// 📋 Unified Logs Endpoint (Auto-detects Environment)
router.use("/", unifiedLogsRouter);

export default router;
`;

console.log('📝 HOTFIX STEPS:');
console.log('1. Created enhanced authentication middleware');
console.log('2. Created debug system status routes');
console.log('3. Generated admin routes fix');

console.log('\n🚀 DEPLOYMENT COMMANDS:');
console.log('# Apply the hotfix:');
console.log('git add .');
console.log('git commit -m "hotfix: Enhanced auth debugging for production 401 errors"');
console.log('git push heroku main');

console.log('\n🔍 TESTING COMMANDS:');
console.log('# Test authentication:');
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app.herokuapp.com/api/admin/system/auth-test');
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app.herokuapp.com/api/admin/system/admin-test');
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app.herokuapp.com/api/admin/system/overview');

console.log('\n⚠️  IMMEDIATE ACTIONS NEEDED:');
console.log('1. Check Heroku environment variables:');
console.log('   heroku config --app your-app-name');
console.log('2. Verify JWT_SECRET is set correctly');
console.log('3. Check if user has admin role in database');
console.log('4. Monitor Heroku logs:');
console.log('   heroku logs --tail --app your-app-name');

console.log('\n🎯 ROOT CAUSE ANALYSIS:');
console.log('The 401 errors are likely caused by:');
console.log('• Missing or incorrect JWT_SECRET in production');
console.log('• Frontend not sending auth token correctly');
console.log('• User not having admin role in database');
console.log('• Token expiration or format issues');

console.log('\n✅ Hotfix files ready for deployment!');

// Write the admin routes fix to a file
const adminRoutesPath = path.join(__dirname, '../src/routes/admin-hotfix.ts');
fs.writeFileSync(adminRoutesPath, adminRoutesFix.trim());
console.log('📄 Created: admin-hotfix.ts');

console.log('\n🔧 To apply the hotfix:');
console.log('1. Replace src/routes/admin.ts with admin-hotfix.ts');
console.log('2. Deploy to Heroku');
console.log('3. Test the debug endpoints');
console.log('4. Check logs for detailed auth information');
