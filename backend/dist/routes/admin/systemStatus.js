"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../../authenticateJWT");
const requireAdminRole_1 = require("../../middleware/requireAdminRole");
const ormconfig_1 = __importDefault(require("../../ormconfig"));
const Payment_1 = require("../../entity/Payment");
const PaymentEvent_1 = require("../../entity/PaymentEvent");
const Escrow_1 = require("../../entity/Escrow");
const PaymentAutomationService_1 = require("../../services/PaymentAutomationService");
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const router = (0, express_1.Router)();
// System health check
async function checkServiceHealth() {
    const healthStatus = {
        database: false,
        junoApi: false,
        bridgeWallet: false,
        mxnbContract: false,
        backend: true // If we're responding, backend is up
    };
    try {
        // Check database
        await ormconfig_1.default.query('SELECT 1');
        healthStatus.database = true;
    }
    catch (error) {
        console.error('Database health check failed:', error);
    }
    try {
        // Check Juno API (simple ping)
        const junoBaseUrl = process.env.JUNO_ENV === 'stage'
            ? 'https://stage.buildwithjuno.com'
            : 'https://buildwithjuno.com';
        const response = await axios_1.default.get(`${junoBaseUrl}/ping`, {
            timeout: 5000,
            validateStatus: () => true // Don't throw on any status
        });
        healthStatus.junoApi = response.status < 500;
    }
    catch (error) {
        console.error('Juno API health check failed:', error);
    }
    // For now, assume bridge wallet and MXNB contract are healthy
    // In production, you'd check blockchain connectivity and contract calls
    healthStatus.bridgeWallet = true;
    healthStatus.mxnbContract = true;
    return healthStatus;
}
// Get system overview statistics
router.get('/overview', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get today's payments
        const todayPayments = await ormconfig_1.default.getRepository(Payment_1.Payment)
            .createQueryBuilder('payment')
            .where('DATE(payment.created_at) = DATE(:today)', { today })
            .getCount();
        // Get active escrows (escrows with status 'active' or 'funded' AND payment status 'escrowed')
        // This should match the "pagos en custodia" count from main dashboard
        // Only count escrows that have associated payments with status 'escrowed'
        const activeEscrows = await ormconfig_1.default.getRepository(Escrow_1.Escrow)
            .createQueryBuilder('escrow')
            .innerJoin('escrow.payment', 'payment')
            .where('escrow.status IN (:...statuses)', {
            statuses: ['active', 'funded']
        })
            .andWhere('payment.status = :paymentStatus', { paymentStatus: 'escrowed' })
            .getCount();
        // Get pending payouts (released escrows with pending payments)
        const pendingPayouts = await ormconfig_1.default.getRepository(Payment_1.Payment)
            .createQueryBuilder('payment')
            .innerJoin('payment.escrow', 'escrow')
            .where('escrow.status = :status', { status: 'released' })
            .andWhere('payment.status = :paymentStatus', { paymentStatus: 'pending' })
            .getCount();
        // Get failed payments needing attention
        const failedPayments = await ormconfig_1.default.getRepository(Payment_1.Payment)
            .createQueryBuilder('payment')
            .where('payment.status = :status', { status: 'failed' })
            .andWhere('DATE(payment.updated_at) >= DATE(:yesterday)', {
            yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000)
        })
            .getCount();
        // Check service health
        const serviceHealth = await checkServiceHealth();
        console.log('Service Health Status:', serviceHealth);
        // Get automation status (PaymentAutomationService doesn't have getInstance)
        const automationStatus = {
            payoutProcessor: 'running', // Assume running from cron jobs
            escrowMonitor: 'running', // Assume running if no errors
            bridgeTransfers: serviceHealth.bridgeWallet ? 'active' : 'error',
            mxnbRedemptions: serviceHealth.junoApi ? 'active' : 'error'
        };
        res.json({
            overview: {
                systemStatus: serviceHealth.database && serviceHealth.backend ? 'active' : 'error',
                automationStatus: automationStatus.payoutProcessor === 'running' ? 'running' : 'error',
                todayPayments,
                activeEscrows,
                pendingPayouts,
                failedPayments
            },
            serviceHealth,
            automationStatus
        });
    }
    catch (error) {
        console.error('Error getting system overview:', error);
        res.status(500).json({ error: 'Failed to get system overview' });
    }
});
// Get recent system activity
router.get('/activity', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const recentEvents = await ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent)
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.payment', 'payment')
            .orderBy('event.created_at', 'DESC')
            .limit(20)
            .getMany();
        const activities = recentEvents.map(event => {
            const payment = event.payment;
            let enhancedDescription = event.description || event.type;
            // Add payment context if available
            if (payment) {
                const paymentInfo = [
                    `Payment #${payment.id}`,
                    payment.amount ? `$${payment.amount} ${payment.currency || 'MXN'}` : null,
                    payment.status ? `Status: ${payment.status}` : null,
                    payment.recipient_email ? `To: ${payment.recipient_email}` : null
                ].filter(Boolean).join(' | ');
                enhancedDescription = `${enhancedDescription} - ${paymentInfo}`;
            }
            return {
                id: event.id,
                type: event.type,
                description: enhancedDescription,
                timestamp: event.created_at,
                status: getEventStatus(event.type),
                paymentId: payment?.id,
                paymentAmount: payment?.amount,
                paymentCurrency: payment?.currency,
                paymentStatus: payment?.status,
                recipientEmail: payment?.recipient_email
            };
        });
        res.json({ activities });
    }
    catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({ error: 'Failed to get recent activity' });
    }
});
// Quick action: Execute payouts manually
router.post('/actions/execute-payouts', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const automationService = new PaymentAutomationService_1.PaymentAutomationService();
        // Trigger payout processing
        console.log('[ADMIN] Manual payout execution triggered');
        const result = await automationService.processPendingPayouts();
        res.json({
            success: true,
            message: 'Payout processing initiated',
            result
        });
    }
    catch (error) {
        console.error('Error executing payouts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute payouts',
            message: error?.message || 'Unknown error occurred'
        });
    }
});
// Enhanced system logs with date/time filtering
router.get('/actions/logs', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const logLevel = req.query.level; // 'error', 'warn', 'info', 'debug'
        // Build query with optional date filtering
        let query = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent)
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.payment', 'payment');
        // Add date filtering if provided
        if (startDate) {
            query = query.andWhere('event.created_at >= :startDate', { startDate: new Date(startDate) });
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Include full end date
            query = query.andWhere('event.created_at <= :endDate', { endDate: endDateTime });
        }
        const logs = await query
            .orderBy('event.created_at', 'DESC')
            .limit(limit)
            .getMany();
        // Filter by log level if specified
        const filteredLogs = logLevel ?
            logs.filter(log => getLogLevel(log.type) === logLevel) :
            logs;
        const formattedLogs = filteredLogs.map(log => {
            const payment = log.payment;
            let detailedMessage = log.description || log.type;
            // Add comprehensive payment details
            if (payment) {
                const paymentDetails = [
                    `Payment ID: ${payment.id}`,
                    `Amount: ${payment.amount} ${payment.currency}`,
                    `Status: ${payment.status}`,
                    payment.payer_email ? `Payer: ${payment.payer_email}` : null,
                    payment.recipient_email ? `Recipient: ${payment.recipient_email}` : null,
                    payment.reference ? `Ref: ${payment.reference}` : null
                ].filter(Boolean).join(' | ');
                detailedMessage = `${log.description || log.type} - ${paymentDetails}`;
            }
            // Format timestamp with full date and time (Mexico timezone)
            const timestamp = new Date(log.created_at);
            const formattedDate = timestamp.toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Mexico_City'
            });
            return {
                id: log.id,
                timestamp: log.created_at,
                formattedTimestamp: formattedDate,
                level: getLogLevel(log.type),
                status: getEventStatus(log.type),
                type: log.type,
                message: detailedMessage,
                isAutomatic: log.is_automatic,
                paymentId: payment?.id,
                paymentAmount: payment?.amount,
                paymentCurrency: payment?.currency,
                paymentStatus: payment?.status,
                recipientEmail: payment?.recipient_email,
                payerEmail: payment?.payer_email,
                reference: payment?.reference
            };
        });
        res.json({ logs: formattedLogs });
    }
    catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({ error: 'Failed to get system logs' });
    }
});
// Get specific payment details
router.get('/payment/:id', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const paymentId = parseInt(req.params.id);
        const payment = await ormconfig_1.default.getRepository(Payment_1.Payment)
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.escrow', 'escrow')
            .leftJoinAndSelect('payment.user', 'user')
            .where('payment.id = :id', { id: paymentId })
            .getOne();
        if (!payment) {
            // Check nearby payments
            const nearbyPayments = await ormconfig_1.default.getRepository(Payment_1.Payment)
                .createQueryBuilder('payment')
                .where('payment.id BETWEEN :start AND :end', {
                start: Math.max(1, paymentId - 5),
                end: paymentId + 5
            })
                .select(['payment.id', 'payment.status', 'payment.amount', 'payment.recipient_email', 'payment.created_at'])
                .orderBy('payment.id', 'DESC')
                .getMany();
            res.json({
                found: false,
                message: `Payment ${paymentId} not found`,
                nearbyPayments
            });
            return;
        }
        // Get payment events separately
        const events = await ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent)
            .createQueryBuilder('event')
            .where('event.payment_id = :paymentId', { paymentId })
            .orderBy('event.created_at', 'DESC')
            .limit(5)
            .getMany();
        const paymentDetails = {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            payerEmail: payment.payer_email,
            recipientEmail: payment.recipient_email,
            reference: payment.reference,
            description: payment.description,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
            escrow: payment.escrow ? {
                id: payment.escrow.id,
                status: payment.escrow.status,
                amount: payment.escrow.custody_amount
            } : null,
            recentEvents: events.slice(-5).map((event) => ({
                type: event.type,
                description: event.description,
                timestamp: event.created_at,
                isAutomatic: event.is_automatic
            }))
        };
        res.json({ found: true, payment: paymentDetails });
    }
    catch (error) {
        console.error('Error getting payment details:', error);
        res.status(500).json({ error: 'Failed to get payment details' });
    }
});
// Quick action: Restart automation services
router.post('/actions/restart-services', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        console.log('[ADMIN] Automation services restart requested');
        // Since PaymentAutomationService runs via cron jobs,
        // we'll just log the restart request for now
        res.json({
            success: true,
            message: 'Automation service restart logged - services run via cron jobs'
        });
    }
    catch (error) {
        console.error('Error restarting services:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restart services',
            message: error?.message || 'Unknown error occurred'
        });
    }
});
// Helper functions
function getEventStatus(eventType) {
    if (eventType.includes('failed') || eventType.includes('error'))
        return 'error';
    if (eventType.includes('completed') || eventType.includes('success'))
        return 'success';
    if (eventType.includes('pending') || eventType.includes('processing'))
        return 'warning';
    return 'info';
}
function getLogLevel(eventType) {
    if (eventType.includes('failed') || eventType.includes('error'))
        return 'error';
    if (eventType.includes('pending') || eventType.includes('warning'))
        return 'warn';
    return 'info';
}
exports.default = router;
