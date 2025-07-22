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
// Admin ticket routes moved to /src/routes/admin.ts
// This avoids path conflicts and keeps admin routes organized

// @route   GET /api/tickets/my-tickets
// @desc    Get all support tickets for the logged-in user
// @access  Private
router.get('/my-tickets', authenticateJWT, getTicketsForUser);

// User routes for tickets
router.get('/:id', authenticateJWT, getTicketById);
router.post('/:id/replies', authenticateJWT, createReply);
router.patch('/:id/close', authenticateJWT, closeTicket);

export default router;
