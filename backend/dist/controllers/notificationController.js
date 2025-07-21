"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Notification_1 = require("../entity/Notification");
const getNotifications = (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    ormconfig_1.default.getRepository(Notification_1.Notification).find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: 20,
    })
        .then(notifications => {
        res.json(notifications);
    })
        .catch(error => {
        next(error);
    });
};
exports.getNotifications = getNotifications;
const getUnreadCount = (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    ormconfig_1.default.getRepository(Notification_1.Notification).count({
        where: { user: { id: userId }, read: false },
    })
        .then(unreadCount => {
        res.json({ unreadCount });
    })
        .catch(error => {
        next(error);
    });
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const notificationRepository = ormconfig_1.default.getRepository(Notification_1.Notification);
    notificationRepository.findOne({ where: { id: parseInt(id), user: { id: userId } } })
        .then(notification => {
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        notification.read = true;
        return notificationRepository.save(notification);
    })
        .then(savedNotification => {
        if (savedNotification) {
            res.json(savedNotification);
        }
    })
        .catch(error => {
        next(error);
    });
};
exports.markAsRead = markAsRead;
const markAllAsRead = (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const notificationRepository = ormconfig_1.default.getRepository(Notification_1.Notification);
    notificationRepository.update({ user: { id: userId }, read: false }, { read: true })
        .then(result => {
        res.json({ message: 'All notifications marked as read', affected: result.affected });
    })
        .catch(error => {
        next(error);
    });
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = (req, res, next) => {
    const authReq = req;
    const userId = authReq.user?.id;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const notificationRepository = ormconfig_1.default.getRepository(Notification_1.Notification);
    notificationRepository.findOne({ where: { id: parseInt(id), user: { id: userId } } })
        .then(notification => {
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        return notificationRepository.remove(notification);
    })
        .then(deletedNotification => {
        if (deletedNotification) {
            res.json({ message: 'Notification deleted successfully' });
        }
    })
        .catch(error => {
        next(error);
    });
};
exports.deleteNotification = deleteNotification;
