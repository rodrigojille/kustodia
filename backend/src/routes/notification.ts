import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController';
import { authenticateJWT } from '../authenticateJWT';

const router = Router();

// All notification routes are protected
router.use(authenticateJWT);

// GET /api/notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// POST /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

export default router;
