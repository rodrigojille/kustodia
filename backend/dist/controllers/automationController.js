"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutomationStatus = exports.triggerAutomation = void 0;
const PaymentAutomationService_1 = require("../services/PaymentAutomationService");
/**
 * Manual trigger for payment automation processes
 */
const triggerAutomation = async (req, res) => {
    const automationService = new PaymentAutomationService_1.PaymentAutomationService();
    try {
        const { process } = req.body;
        let result;
        switch (process) {
            case 'deposits':
                await automationService.processNewDeposits();
                result = 'Procesamiento de depósitos ejecutado';
                break;
            case 'custodies':
                await automationService.releaseExpiredCustodies();
                result = 'Liberación de custodias expiradas ejecutada';
                break;
            case 'withdrawals':
                await automationService.processJunoWithdrawals();
                result = 'Procesamiento de retiros de Juno ejecutado';
                break;
            case 'payouts':
                await automationService.processPendingPayouts();
                result = 'Procesamiento de pagos pendientes ejecutado';
                break;
            case 'sync':
                await automationService.syncBlockchainStatuses();
                result = 'Sincronización con blockchain ejecutada';
                break;
            case 'all':
                await automationService.processNewDeposits();
                await automationService.processJunoWithdrawals();
                await automationService.processPendingPayouts();
                await automationService.releaseExpiredCustodies();
                await automationService.syncBlockchainStatuses();
                result = 'Todos los procesos de automatización ejecutados';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Proceso no válido. Opciones: deposits, custodies, sync, all'
                });
        }
        res.json({
            success: true,
            message: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error en automatización manual:', errorMessage);
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
exports.triggerAutomation = triggerAutomation;
/**
 * Get automation status and metrics
 */
const getAutomationStatus = async (req, res) => {
    try {
        // This would be enhanced with actual metrics from a monitoring system
        res.json({
            success: true,
            status: 'running',
            lastRun: {
                deposits: 'Running every 5 minutes',
                custodies: 'Running every 10 minutes',
                sync: 'Running every hour'
            },
            nextRun: {
                deposits: 'Next run in ~' + (5 - (Date.now() % (5 * 60 * 1000)) / (60 * 1000)).toFixed(1) + ' minutes',
                custodies: 'Next run in ~' + (10 - (Date.now() % (10 * 60 * 1000)) / (60 * 1000)).toFixed(1) + ' minutes',
                sync: 'Next run in ~' + (60 - (Date.now() % (60 * 60 * 1000)) / (60 * 1000)).toFixed(1) + ' minutes'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error obteniendo estado de automatización:', errorMessage);
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
exports.getAutomationStatus = getAutomationStatus;
