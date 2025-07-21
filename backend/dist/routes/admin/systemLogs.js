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
const PaymentEvent_1 = require("../../entity/PaymentEvent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (0, express_1.Router)();
// System logs endpoint - combines database events and file logs
router.get('/logs', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const logLevel = req.query.level; // 'error', 'warn', 'info', 'debug'
        console.log(`[ADMIN] Fetching system logs: limit=${limit}, level=${logLevel}`);
        // Fetch database events (payment events)
        let query = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent)
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.payment', 'payment')
            .orderBy('event.created_at', 'DESC')
            .limit(limit);
        if (startDate) {
            query = query.andWhere('event.created_at >= :startDate', { startDate: new Date(startDate) });
        }
        if (endDate) {
            query = query.andWhere('event.created_at <= :endDate', { endDate: new Date(endDate) });
        }
        const dbEvents = await query.getMany();
        // Try to read application log files (if they exist)
        const logDir = path.join(__dirname, '../../../logs');
        let fileLogs = [];
        try {
            if (fs.existsSync(logDir)) {
                const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
                for (const logFile of logFiles.slice(0, 3)) { // Read up to 3 recent log files
                    const logPath = path.join(logDir, logFile);
                    const content = fs.readFileSync(logPath, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    // Parse log lines (assuming JSON format or structured logs)
                    for (const line of lines.slice(-20)) { // Last 20 lines per file
                        try {
                            if (line.trim().startsWith('{')) {
                                const logEntry = JSON.parse(line);
                                fileLogs.push({
                                    timestamp: new Date(logEntry.timestamp || Date.now()),
                                    level: logEntry.level || 'info',
                                    message: logEntry.message || line,
                                    source: 'file',
                                    filename: logFile,
                                    rawLine: line
                                });
                            }
                            else {
                                // Plain text log parsing
                                const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
                                const timestamp = match ? new Date(match[1]) : new Date();
                                fileLogs.push({
                                    timestamp,
                                    level: getLogLevelFromLine(line),
                                    message: line,
                                    source: 'file',
                                    filename: logFile,
                                    rawLine: line
                                });
                            }
                        }
                        catch (parseError) {
                            // Skip unparseable lines
                        }
                    }
                }
            }
        }
        catch (fileError) {
            console.log('[ADMIN] No file logs found or unable to read:', fileError.message);
        }
        // Combine and format all logs
        const combinedLogs = [
            // Database events
            ...dbEvents.map(event => {
                const payment = event.payment;
                let detailedMessage = event.description || event.type;
                if (payment) {
                    const paymentDetails = [
                        `Payment ID: ${payment.id}`,
                        `Amount: $${payment.amount} ${payment.currency}`,
                        `Status: ${payment.status}`,
                        `Recipient: ${payment.recipient_email}`,
                        ...(payment.reference ? [`Reference: ${payment.reference}`] : [])
                    ];
                    detailedMessage += ` | ${paymentDetails.join(' | ')}`;
                }
                const formattedDate = event.created_at.toLocaleString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/Mexico_City'
                });
                return {
                    id: event.id,
                    timestamp: event.created_at,
                    formattedTimestamp: formattedDate,
                    level: getLogLevel(event.type),
                    status: getEventStatus(event.type),
                    type: event.type,
                    message: detailedMessage,
                    source: 'database',
                    paymentId: payment?.id,
                    paymentAmount: payment?.amount,
                    paymentCurrency: payment?.currency,
                    paymentStatus: payment?.status,
                    recipientEmail: payment?.recipient_email,
                    payerEmail: payment?.payer_email,
                    reference: payment?.reference
                };
            }),
            // File logs
            ...fileLogs.map(log => ({
                id: `file_${Date.now()}_${Math.random()}`,
                timestamp: log.timestamp,
                formattedTimestamp: log.timestamp.toLocaleString('es-MX', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'America/Mexico_City'
                }),
                level: log.level,
                status: log.level === 'error' ? 'error' : 'info',
                type: 'system',
                message: log.message,
                source: 'file',
                filename: log.filename,
                rawLine: log.rawLine
            }))
        ];
        // Sort by timestamp (newest first)
        combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        // Filter by log level if specified
        const filteredLogs = logLevel && logLevel !== 'all'
            ? combinedLogs.filter(log => log.level === logLevel)
            : combinedLogs;
        // Apply limit
        const limitedLogs = filteredLogs.slice(0, limit);
        console.log(`[ADMIN] Returning ${limitedLogs.length} logs (${dbEvents.length} from DB, ${fileLogs.length} from files)`);
        res.json({
            logs: limitedLogs,
            totalLogs: combinedLogs.length,
            dbEvents: dbEvents.length,
            fileLogs: fileLogs.length,
            environment: 'local',
            source: 'mixed'
        });
    }
    catch (error) {
        console.error('Error getting system logs:', error);
        res.status(500).json({ error: 'Failed to get system logs' });
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
function getLogLevelFromLine(line) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('fail') || lowerLine.includes('exception')) {
        return 'error';
    }
    if (lowerLine.includes('warn') || lowerLine.includes('warning')) {
        return 'warn';
    }
    if (lowerLine.includes('debug') || lowerLine.includes('trace')) {
        return 'debug';
    }
    return 'info';
}
exports.default = router;
