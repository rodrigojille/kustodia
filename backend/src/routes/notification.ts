import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController';
import { authenticateJWT } from '../authenticateJWT';

const router = Router();

// All notification routes are protected
router.use(authenticateJWT);

// GET /api/notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

export default router;
