import { Router } from 'express';
import { createTicket, getTicketsForUser, getTicketById, getTicketsForAdmin, createReply, closeTicket } from '../controllers/ticketController';
import { authenticateJWT } from '../authenticateJWT';
// import { requireAdmin } from '../middleware/requireAdmin'; // Assuming an admin middleware exists

const router = Router();

// @route   POST /api/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/', authenticateJWT, createTicket);

// @route   GET /api/admin/tickets
// @desc    Get all support tickets for the admin dashboard
// @access  Private (should be admin only)
// Add 'requireAdmin' middleware once it's available
router.get('/admin', authenticateJWT, getTicketsForAdmin);

// @route   GET /api/tickets/my-tickets
// @desc    Get all support tickets for the logged-in user
// @access  Private
router.get('/my-tickets', authenticateJWT, getTicketsForUser);
router.get('/:id', authenticateJWT, getTicketById);
router.post('/:id/replies', authenticateJWT, createReply);
router.patch('/:id/close', authenticateJWT, closeTicket);

export default router;
