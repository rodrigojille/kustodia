import { Router } from 'express';
import { createTicket, getTicketsForUser, getTicketById, getTicketsForAdmin, createReply, closeTicket } from '../controllers/ticketController';
import { authenticateJWT } from '../authenticateJWT';
// import { requireAdmin } from '../middleware/requireAdmin'; // Assuming an admin middleware exists

const router = Router();

// @route   POST /api/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/', authenticateJWT, createTicket);

// @route   GET /api/tickets/admin
// @desc    Get all support tickets for the admin dashboard
// @access  Private (should be admin only)
// Add 'requireAdmin' middleware once it's available
router.get('/admin', authenticateJWT, getTicketsForAdmin);

// Admin-specific routes for individual tickets - these should match frontend expectations
// @route   GET /api/admin/tickets/:id
// @desc    Get individual ticket details for admin
// @access  Private (admin)
router.get('/admin/tickets/:id', authenticateJWT, getTicketById);

// @route   POST /api/admin/tickets/:id/reply
// @desc    Admin reply to ticket
// @access  Private (admin)
router.post('/admin/tickets/:id/reply', authenticateJWT, createReply);

// @route   PATCH /api/admin/tickets/:id/close
// @desc    Admin close ticket
// @access  Private (admin)
router.patch('/admin/tickets/:id/close', authenticateJWT, closeTicket);

// @route   GET /api/tickets/my-tickets
// @desc    Get all support tickets for the logged-in user
// @access  Private
router.get('/my-tickets', authenticateJWT, getTicketsForUser);

// User routes for tickets
router.get('/:id', authenticateJWT, getTicketById);
router.post('/:id/replies', authenticateJWT, createReply);
router.patch('/:id/close', authenticateJWT, closeTicket);

export default router;
