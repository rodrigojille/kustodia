"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentNotificationsForUser = exports.createAccountNotifications = exports.createDisputeNotifications = exports.createPaymentNotifications = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const PaymentEvent_1 = require("../entity/PaymentEvent");
const notificationService_1 = require("./notificationService");
const PAYMENT_NOTIFICATION_CONFIGS = {
    payment_created: {
        message: 'Tu pago ha sido creado exitosamente',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_created: {
        message: 'La custodia ha sido creada y está activa',
        type: 'info',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_funded: {
        message: 'Tu pago ha sido fondeado en la custodia on-chain exitosamente',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    funds_received: {
        message: 'Los fondos han sido recibidos en la custodia',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_executing: {
        message: 'La custodia está en proceso de ejecución',
        type: 'info',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_finished: {
        message: 'La custodia ha finalizado exitosamente',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    payment_released: {
        message: 'El pago ha sido liberado y transferido',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    payment_cancelled: {
        message: 'El pago ha sido cancelado',
        type: 'warning',
        notifyBuyer: true,
        notifySeller: true
    },
    payment_failed: {
        message: 'El pago ha fallado. Por favor, revisa los detalles',
        type: 'error',
        notifyBuyer: true,
        notifySeller: true
    },
    dispute_started: {
        message: 'Se ha iniciado una disputa en este pago',
        type: 'warning',
        notifyBuyer: true,
        notifySeller: true
    },
    bridge_withdrawal_success: {
        message: 'El retiro de fondos se completó exitosamente',
        type: 'success',
        notifyBuyer: false,
        notifySeller: true
    },
    payout_completed: {
        message: 'El pago ha sido completado y enviado al beneficiario',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_release_success: {
        message: 'La custodia ha sido liberada del contrato inteligente',
        type: 'info',
        notifyBuyer: true,
        notifySeller: true
    },
    payout_processing_error: {
        message: 'Ocurrió un error al procesar el pago',
        type: 'error',
        notifyBuyer: true,
        notifySeller: true
    },
    escrow_error: {
        message: 'Ocurrió un error con la custodia',
        type: 'error',
        notifyBuyer: true,
        notifySeller: true
    }
};
const DISPUTE_NOTIFICATION_CONFIGS = {
    dispute_created: {
        message: 'Se ha creado una nueva disputa',
        type: 'warning',
        notifyBuyer: true,
        notifySeller: true
    },
    dispute_updated: {
        message: 'La disputa ha sido actualizada',
        type: 'info',
        notifyBuyer: true,
        notifySeller: true
    },
    dispute_resolved: {
        message: 'La disputa ha sido resuelta',
        type: 'success',
        notifyBuyer: true,
        notifySeller: true
    },
    dispute_escalated: {
        message: 'La disputa ha sido escalada para revisión',
        type: 'warning',
        notifyBuyer: true,
        notifySeller: true
    },
    dispute_cancelled: {
        message: 'La disputa ha sido cancelada',
        type: 'info',
        notifyBuyer: true,
        notifySeller: true
    }
};
const ACCOUNT_NOTIFICATION_CONFIGS = {
    account_verified: {
        message: 'Tu cuenta ha sido verificada exitosamente',
        type: 'success',
        notifyUser: true
    },
    kyc_approved: {
        message: 'Tu verificación KYC ha sido aprobada',
        type: 'success',
        notifyUser: true
    },
    kyc_rejected: {
        message: 'Tu verificación KYC ha sido rechazada. Revisa los detalles',
        type: 'error',
        notifyUser: true
    },
    kyc_pending: {
        message: 'Tu verificación KYC está en proceso de revisión',
        type: 'info',
        notifyUser: true
    },
    security_alert: {
        message: 'Alerta de seguridad en tu cuenta',
        type: 'warning',
        notifyUser: true
    },
    login_suspicious: {
        message: 'Se detectó un intento de acceso sospechoso',
        type: 'warning',
        notifyUser: true
    },
    password_changed: {
        message: 'Tu contraseña ha sido cambiada exitosamente',
        type: 'success',
        notifyUser: true
    },
    email_changed: {
        message: 'Tu dirección de email ha sido actualizada',
        type: 'info',
        notifyUser: true
    },
    profile_updated: {
        message: 'Tu perfil ha sido actualizado exitosamente',
        type: 'success',
        notifyUser: true
    }
};
/**
 * Creates notifications for payment events
 * @param paymentId - The payment ID
 * @param eventType - The type of payment event
 * @param customMessage - Optional custom message to override default
 */
const createPaymentNotifications = async (paymentId, eventType, customMessage) => {
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['user', 'seller']
        });
        if (!payment) {
            console.error(`Payment with ID ${paymentId} not found`);
            return;
        }
        const config = PAYMENT_NOTIFICATION_CONFIGS[eventType];
        const message = customMessage || config.message;
        const link = `/dashboard/pagos/${paymentId}`;
        // Create PaymentEvent record
        const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
        const paymentEvent = new PaymentEvent_1.PaymentEvent();
        paymentEvent.payment = payment;
        paymentEvent.paymentId = paymentId;
        paymentEvent.type = eventType;
        paymentEvent.description = message;
        await paymentEventRepo.save(paymentEvent);
        // Notify buyer (payment creator)
        if (config.notifyBuyer && payment.user) {
            await (0, notificationService_1.createNotification)(payment.user.id, `${message} - Pago #${paymentId}`, link, config.type, paymentId, 'payment');
        }
        // Notify seller (payment recipient)
        if (config.notifySeller && payment.seller && payment.seller.id !== payment.user?.id) {
            await (0, notificationService_1.createNotification)(payment.seller.id, `${message} - Pago #${paymentId}`, link, config.type, paymentId, 'payment');
        }
        console.log(`Payment notifications created for payment ${paymentId}, event: ${eventType}`);
    }
    catch (error) {
        console.error('Error creating payment notifications:', error);
    }
};
exports.createPaymentNotifications = createPaymentNotifications;
/**
 * Creates notifications for dispute events
 * @param disputeId - The dispute ID
 * @param paymentId - The related payment ID
 * @param eventType - The type of dispute event
 * @param customMessage - Optional custom message to override default
 */
const createDisputeNotifications = async (disputeId, paymentId, eventType, customMessage) => {
    try {
        const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
        const payment = await paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['user', 'seller']
        });
        if (!payment) {
            console.error(`Payment with ID ${paymentId} not found`);
            return;
        }
        const config = DISPUTE_NOTIFICATION_CONFIGS[eventType];
        const message = customMessage || config.message;
        const link = `/dashboard/disputas/${disputeId}`;
        // Notify buyer (payment creator)
        if (config.notifyBuyer && payment.user) {
            await (0, notificationService_1.createNotification)(payment.user.id, `${message} - Disputa #${disputeId}`, link, config.type, paymentId, 'dispute');
        }
        // Notify seller (payment recipient)
        if (config.notifySeller && payment.seller && payment.seller.id !== payment.user?.id) {
            await (0, notificationService_1.createNotification)(payment.seller.id, `${message} - Disputa #${disputeId}`, link, config.type, paymentId, 'dispute');
        }
        console.log(`Dispute notifications created for dispute ${disputeId}, event: ${eventType}`);
    }
    catch (error) {
        console.error('Error creating dispute notifications:', error);
    }
};
exports.createDisputeNotifications = createDisputeNotifications;
/**
 * Creates notifications for account events
 * @param userId - The user ID
 * @param eventType - The type of account event
 * @param customMessage - Optional custom message to override default
 */
const createAccountNotifications = async (userId, eventType, customMessage) => {
    try {
        const config = ACCOUNT_NOTIFICATION_CONFIGS[eventType];
        const message = customMessage || config.message;
        let link = '/dashboard/configuracion';
        if (eventType.startsWith('kyc_')) {
            link = '/dashboard/configuracion/kyc';
        }
        else if (eventType.includes('security') || eventType.includes('login')) {
            link = '/dashboard/configuracion/seguridad';
        }
        if (config.notifyUser) {
            await (0, notificationService_1.createNotification)(userId, message, link, config.type, undefined, 'account');
        }
        console.log(`Account notification created for user ${userId}, event: ${eventType}`);
    }
    catch (error) {
        console.error('Error creating account notification:', error);
    }
};
exports.createAccountNotifications = createAccountNotifications;
/**
 * Get payment notifications for a specific user
 * @param userId - The user ID
 * @param limit - Maximum number of notifications to return
 */
const getPaymentNotificationsForUser = async (userId, limit = 20) => {
    try {
        const notificationRepo = ormconfig_1.default.getRepository('Notification');
        const notifications = await notificationRepo
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.payment', 'payment')
            .where('notification.user_id = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .limit(limit)
            .getMany();
        return notifications.map(notification => ({
            id: notification.id,
            message: notification.message,
            type: notification.type,
            read: notification.read,
            link: notification.link,
            createdAt: notification.createdAt,
            payment: notification.payment ? {
                id: notification.payment.id,
                amount: notification.payment.amount,
                currency: notification.payment.currency,
                status: notification.payment.status,
                description: notification.payment.description
            } : null
        }));
    }
    catch (error) {
        console.error('Error fetching payment notifications:', error);
        return [];
    }
};
exports.getPaymentNotificationsForUser = getPaymentNotificationsForUser;
