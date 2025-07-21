"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authenticateJWT_1 = require("../authenticateJWT");
const router = (0, express_1.Router)();
// All notification routes are protected
router.use(authenticateJWT_1.authenticateJWT);
// GET /api/notifications
router.get('/', notificationController_1.getNotifications);
// GET /api/notifications/unread-count
router.get('/unread-count', notificationController_1.getUnreadCount);
// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController_1.markAsRead);
// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', notificationController_1.markAllAsRead);
// DELETE /api/notifications/:id
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
