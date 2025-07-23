"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
const authenticateJWT_1 = require("../authenticateJWT");
// import { requireAdmin } from '../middleware/requireAdmin'; // Assuming an admin middleware exists
const router = (0, express_1.Router)();
// @route   POST /api/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/', authenticateJWT_1.authenticateJWT, ticketController_1.createTicket);
// @route   GET /api/tickets/admin
// @desc    Get all support tickets for the admin dashboard
// @access  Private (should be admin only)
// Add 'requireAdmin' middleware once it's available
router.get('/admin', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketsForAdmin);
// Admin-specific routes for individual tickets - these should match frontend expectations
// Admin ticket routes moved to /src/routes/admin.ts
// This avoids path conflicts and keeps admin routes organized
// @route   GET /api/tickets/my-tickets
// @desc    Get all support tickets for the logged-in user
// @access  Private
router.get('/my-tickets', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketsForUser);
// User routes for tickets
router.get('/:id', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketById);
router.post('/:id/replies', authenticateJWT_1.authenticateJWT, ticketController_1.createReply);
router.patch('/:id/close', authenticateJWT_1.authenticateJWT, ticketController_1.closeTicket);
exports.default = router;
