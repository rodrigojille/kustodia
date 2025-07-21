"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const automationController_1 = require("../controllers/automationController");
const router = (0, express_1.Router)();
/**
 * POST /api/automation/trigger
 * Manual trigger for automation processes
 * Body: { process: 'deposits' | 'custodies' | 'payouts' | 'sync' | 'all' }
 */
router.post('/trigger', async (req, res) => {
    await (0, automationController_1.triggerAutomation)(req, res);
});
/**
 * GET /api/automation/status
 * Get current automation status and schedule
 */
router.get('/status', async (req, res) => {
    await (0, automationController_1.getAutomationStatus)(req, res);
});
exports.default = router;
