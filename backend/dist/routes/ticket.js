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
// @route   GET /api/admin/tickets/:id
// @desc    Get individual ticket details for admin
// @access  Private (admin)
router.get('/admin/tickets/:id', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketById);
// @route   POST /api/admin/tickets/:id/reply
// @desc    Admin reply to ticket
// @access  Private (admin)
router.post('/admin/tickets/:id/reply', authenticateJWT_1.authenticateJWT, ticketController_1.createReply);
// @route   PATCH /api/admin/tickets/:id/close
// @desc    Admin close ticket
// @access  Private (admin)
router.patch('/admin/tickets/:id/close', authenticateJWT_1.authenticateJWT, ticketController_1.closeTicket);
// @route   GET /api/tickets/my-tickets
// @desc    Get all support tickets for the logged-in user
// @access  Private
router.get('/my-tickets', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketsForUser);
// User routes for tickets
router.get('/:id', authenticateJWT_1.authenticateJWT, ticketController_1.getTicketById);
router.post('/:id/replies', authenticateJWT_1.authenticateJWT, ticketController_1.createReply);
router.patch('/:id/close', authenticateJWT_1.authenticateJWT, ticketController_1.closeTicket);
exports.default = router;
