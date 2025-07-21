"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Notification_1 = require("../entity/Notification");
const User_1 = require("../entity/User");
/**
 * Creates and saves a new notification for a user.
 *
 * @param userId - The ID of the user to notify.
 * @param message - The notification message.
 * @param link - The URL the notification should link to.
 * @param type - The notification type (success, info, warning, error).
 * @param paymentId - Optional payment ID to link the notification to.
 * @param category - The notification category (payment, dispute, account, general).
 */
const createNotification = async (userId, message, link, type = 'info', paymentId, category = 'general') => {
    try {
        const notificationRepo = ormconfig_1.default.getRepository(Notification_1.Notification);
        const userRepo = ormconfig_1.default.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ id: userId });
        if (!user) {
            console.error(`Attempted to create notification for non-existent user with ID: ${userId}`);
            return;
        }
        const newNotification = new Notification_1.Notification();
        newNotification.user = user;
        newNotification.message = message;
        newNotification.link = link;
        newNotification.type = type;
        newNotification.category = category;
        newNotification.read = false;
        if (paymentId) {
            newNotification.payment_id = paymentId;
        }
        await notificationRepo.save(newNotification);
        console.log(`Notification created for user ${userId}: "${message}"`);
    }
    catch (error) {
        console.error('Error creating notification:', error);
        // Depending on requirements, you might want to throw the error
        // to be handled by the calling function.
    }
};
exports.createNotification = createNotification;
