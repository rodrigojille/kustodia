"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../authenticateJWT");
const requireAdminRole_1 = require("../middleware/requireAdminRole");
const analyticsController_1 = require("../controllers/analyticsController");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const router = (0, express_1.Router)();
// =============================================================================
// 🎯 CUSTOMER ANALYTICS DASHBOARD ROUTES
// =============================================================================
// Admin-only analytics endpoints
router.get('/key-metrics', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, analyticsController_1.getKeyMetrics);
router.get('/acquisition', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, analyticsController_1.getAcquisitionAnalytics);
router.get('/transactions', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, analyticsController_1.getPaymentsAnalytics);
router.get('/growth-kpis', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, analyticsController_1.getGrowthKPIs);
router.get('/trends', authenticateJWT_1.authenticateJWT, requireAdminRole_1.requireAdminRole, analyticsController_1.getTrends);
// Legacy route - keeping for backward compatibility
router.get('/stats', authenticateJWT_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || 'current_month';
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        // Generate date filters based on period
        let dateFilter = '';
        let dateParams = [];
        switch (period) {
            case 'current_month':
                dateFilter = 'AND EXTRACT(MONTH FROM created_at) = $2 AND EXTRACT(YEAR FROM created_at) = $3';
                dateParams = [currentMonth, currentYear];
                break;
            case 'last_month':
                dateFilter = 'AND EXTRACT(MONTH FROM created_at) = $2 AND EXTRACT(YEAR FROM created_at) = $3';
                dateParams = [lastMonth, lastMonthYear];
                break;
            case 'last_3_months':
                const date3MonthsAgo = new Date();
                date3MonthsAgo.setMonth(date3MonthsAgo.getMonth() - 3);
                dateFilter = 'AND created_at >= $2';
                dateParams = [date3MonthsAgo.toISOString()];
                break;
            case 'last_6_months':
                const date6MonthsAgo = new Date();
                date6MonthsAgo.setMonth(date6MonthsAgo.getMonth() - 6);
                dateFilter = 'AND created_at >= $2';
                dateParams = [date6MonthsAgo.toISOString()];
                break;
            case 'current_year':
                dateFilter = 'AND EXTRACT(YEAR FROM created_at) = $2';
                dateParams = [currentYear];
                break;
            case 'all_time':
            default:
                dateFilter = '';
                dateParams = [];
                break;
        }
        // Query for payments in selected period
        const paymentsQuery = `
      SELECT COUNT(*) as count
      FROM payment 
      WHERE user_id = $1 
      ${dateFilter}
    `;
        // Query for total volume (sum of all successful payments)
        const totalVolumeQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment 
      WHERE user_id = $1 
      AND status = 'completed'
      ${dateFilter}
    `;
        // Query for pending payments
        const pendingPaymentsQuery = `
      SELECT COUNT(*) as count
      FROM payment 
      WHERE user_id = $1 
      AND status IN ('pending', 'processing', 'awaiting_confirmation')
    `;
        // Execute all queries
        const [paymentsResult, volumeResult, pendingResult] = await Promise.all([
            ormconfig_1.default.query(paymentsQuery, [userId, ...dateParams]),
            ormconfig_1.default.query(totalVolumeQuery, [userId, ...dateParams]),
            ormconfig_1.default.query(pendingPaymentsQuery, [userId])
        ]);
        // Debug logging
        console.log('🔍 Analytics Debug:', {
            userId,
            currentMonth,
            currentYear,
            paymentsResult: paymentsResult?.[0],
            volumeResult: volumeResult?.[0],
            pendingResult: pendingResult?.[0]
        });
        // Additional queries for trends and recent activity (filtered by period)
        const completedPaymentsQuery = `
      SELECT COUNT(*) as count FROM payment 
      WHERE user_id = $1 AND status = 'completed' ${dateFilter}
    `;
        const lastMonthPaymentsQuery = `
      SELECT COUNT(*) as count FROM payment 
      WHERE user_id = $1 AND status = 'completed'
      AND EXTRACT(MONTH FROM created_at) = $2
      AND EXTRACT(YEAR FROM created_at) = $3
    `;
        const avgProcessingTimeQuery = `
      SELECT AVG(EXTRACT(epoch FROM (updated_at - created_at))/86400) as avg_time
      FROM payment 
      WHERE user_id = $1 AND status = 'completed' AND updated_at IS NOT NULL ${dateFilter}
    `;
        const recentPaymentsQuery = `
      SELECT id, amount, status, created_at, updated_at
      FROM payment 
      WHERE user_id = $1 ${dateFilter}
      ORDER BY created_at DESC 
      LIMIT 5
    `;
        // Execute additional queries with proper parameters
        const [completedResult, lastMonthResult, avgTimeResult, recentResult] = await Promise.all([
            ormconfig_1.default.query(completedPaymentsQuery, dateParams ? [userId, ...dateParams] : [userId]),
            ormconfig_1.default.query(lastMonthPaymentsQuery, [userId, lastMonth, lastMonthYear]),
            ormconfig_1.default.query(avgProcessingTimeQuery, dateParams ? [userId, ...dateParams] : [userId]),
            ormconfig_1.default.query(recentPaymentsQuery, dateParams ? [userId, ...dateParams] : [userId])
        ]);
        // Calculate trends with defensive checks
        const completedThisMonth = parseInt(completedResult?.[0]?.count || '0');
        const completedLastMonth = parseInt(lastMonthResult?.[0]?.count || '0');
        const completedGrowth = completedLastMonth > 0
            ? Math.round(((completedThisMonth - completedLastMonth) / completedLastMonth) * 100)
            : completedThisMonth > 0 ? 100 : 0;
        const avgProcessingDays = parseFloat(avgTimeResult?.[0]?.avg_time || '0');
        const totalCompleted = parseInt(completedResult?.[0]?.count || '0');
        const totalPayments = totalCompleted + parseInt(pendingResult?.[0]?.count || '0');
        const successRate = totalPayments > 0 ? Math.round((totalCompleted / totalPayments) * 100) : 0;
        // Format recent activity with defensive checks
        const recentActivity = (recentResult || []).map((payment) => {
            const createdAt = new Date(payment.created_at);
            const now = new Date();
            const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
            let timeAgo = '';
            if (diffHours < 1) {
                timeAgo = 'Hace menos de 1 hora';
            }
            else if (diffHours < 24) {
                timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            }
            else {
                const diffDays = Math.floor(diffHours / 24);
                timeAgo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
            }
            let statusText = '';
            let statusColor = '';
            switch (payment.status) {
                case 'completed':
                    statusText = 'Pago completado';
                    statusColor = 'green';
                    break;
                case 'pending':
                    statusText = 'Nuevo pago creado';
                    statusColor = 'blue';
                    break;
                case 'in_custody':
                case 'escrowed':
                    statusText = 'Pago en custodia';
                    statusColor = 'amber';
                    break;
                default:
                    statusText = `Pago ${payment.status}`;
                    statusColor = 'gray';
            }
            return {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                statusText,
                statusColor,
                timeAgo
            };
        });
        const analytics = {
            paymentsCount: parseInt(paymentsResult?.[0]?.count || '0'),
            totalVolume: parseFloat(volumeResult?.[0]?.total || '0'),
            pendingPayments: parseInt(pendingResult?.[0]?.count || '0'),
            trends: {
                completedGrowth: completedGrowth,
                avgProcessingDays: Math.round(avgProcessingDays * 10) / 10, // Round to 1 decimal
                successRate: successRate
            },
            recentActivity: recentActivity
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch analytics data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Export analytics data as PDF or Excel
router.get('/export', authenticateJWT_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const format = req.query.format;
        const period = req.query.period || 'current_month';
        if (!format || !['pdf', 'excel'].includes(format)) {
            res.status(400).json({ error: 'Formato no válido' });
            return;
        }
        // Get analytics data
        const response = await fetch(`http://localhost:4000/api/analytics/stats?period=${period}`, {
            headers: {
                'Authorization': req.headers.authorization || '',
                'x-auth-token': req.headers['x-auth-token'] || ''
            }
        });
        if (!response.ok) {
            res.status(500).json({ error: 'Error al obtener datos de análisis' });
            return;
        }
        const data = await response.json();
        if (format === 'pdf') {
            // For now, return a mock PDF response
            // In production, you would use a library like puppeteer or pdfkit
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.pdf`);
            // Create a simple text-based "PDF" for demo purposes
            const pdfContent = `
REPORTE DE ANÁLISIS - ${period.toUpperCase()}
========================================

Pagos en el período: ${data.paymentsCount}
Volumen total: $${data.totalVolume.toLocaleString()}
Pagos pendientes: ${data.pendingPayments}

Tendencias:
- Crecimiento: ${data.trends.completedGrowth}%
- Días promedio de procesamiento: ${data.trends.avgProcessingDays}
- Tasa de éxito: ${data.trends.successRate}%

Generado el: ${new Date().toLocaleString('es-ES')}
`;
            res.setHeader('Content-Length', Buffer.byteLength(pdfContent));
            res.send(pdfContent);
            return;
        }
        else {
            // Excel format
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.xlsx`);
            // Create a simple CSV-like content for demo purposes
            // In production, you would use a library like exceljs
            const csvContent = `Métrica,Valor\r\nPagos en el período,${data.paymentsCount}\r\nVolumen total,$${data.totalVolume}\r\nPagos pendientes,${data.pendingPayments}\r\nCrecimiento completado,${data.trends.completedGrowth}%\r\nDías promedio procesamiento,${data.trends.avgProcessingDays}\r\nTasa de éxito,${data.trends.successRate}%\r\nGenerado,${new Date().toLocaleString('es-ES')}\r\n`;
            res.send(Buffer.from(csvContent));
            return;
        }
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
