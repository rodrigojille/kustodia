import { Request, Response } from "express";
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import AppDataSource from '../ormconfig';
import { Between, LessThan, MoreThan, IsNull } from 'typeorm';

// =============================================================================
// 🎯 CUSTOMER ANALYTICS DASHBOARD API ENDPOINTS
// =============================================================================

// Enhanced retry logic utility
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * backoffMs));
    }
  }
  throw new Error('Max retries exceeded');
};

// Get key metrics overview
export const getKeyMetrics = async (req: Request, res: Response) => {
  try {
    const { period = '30d', status, type } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Build filter conditions
    const statusFilter = status && status !== 'all' ? `AND p.status = '${status}'` : '';
    const typeFilter = type && type !== 'all' ? `AND p.type = '${type}'` : '';
    
    const metrics = await withRetry(async () => {
      // Current period metrics
      const [currentMetrics] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 THEN u.id END) as new_users,
          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL AND p.created_at >= $1 ${statusFilter} ${typeFilter} THEN COALESCE(p.user_id, p.seller_id) END) as active_transactors,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.status = 'completed' ${typeFilter} THEN CAST(p.amount AS NUMERIC) END), 0) as total_revenue,
          COUNT(CASE WHEN p.created_at >= $1 ${statusFilter} ${typeFilter} THEN p.id END) as total_transactions,
          COUNT(CASE WHEN e.created_at >= $1 THEN e.id END) as total_escrows,
          COALESCE(AVG(CASE WHEN p.created_at >= $1 AND p.status = 'completed' ${typeFilter} THEN CAST(p.amount AS NUMERIC) END), 0) as avg_transaction_amount
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
        LEFT JOIN escrow e ON e.payment_id = p.id
      `, [startDate]);

      // Previous period metrics for comparison
      const [previousMetrics] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 AND u.created_at < $2 THEN u.id END) as new_users,
          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL AND p.created_at >= $1 AND p.created_at < $2 THEN COALESCE(p.user_id, p.seller_id) END) as active_transactors,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.created_at < $2 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as total_revenue,
          COUNT(CASE WHEN p.created_at >= $1 AND p.created_at < $2 THEN p.id END) as total_transactions,
          COUNT(CASE WHEN e.created_at >= $1 AND e.created_at < $2 THEN e.id END) as total_escrows
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
        LEFT JOIN escrow e ON e.payment_id = p.id
      `, [previousStartDate, startDate]);

      return { currentMetrics, previousMetrics };
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      success: true,
      period,
      metrics: {
        totalUsers: {
          value: parseInt(metrics.currentMetrics.total_users),
          growth: 0 // Total users don't have growth comparison
        },
        newUsers: {
          value: parseInt(metrics.currentMetrics.new_users),
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.new_users),
            parseInt(metrics.previousMetrics.new_users)
          )
        },
        activeTransactors: {
          value: parseInt(metrics.currentMetrics.active_transactors),
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.active_transactors),
            parseInt(metrics.previousMetrics.active_transactors)
          )
        },
        totalRevenue: {
          value: parseFloat(metrics.currentMetrics.total_revenue),
          growth: calculateGrowth(
            parseFloat(metrics.currentMetrics.total_revenue),
            parseFloat(metrics.previousMetrics.total_revenue)
          )
        },
        totalTransactions: {
          value: parseInt(metrics.currentMetrics.total_transactions),
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.total_transactions),
            parseInt(metrics.previousMetrics.total_transactions)
          )
        },
        totalEscrows: {
          value: parseInt(metrics.currentMetrics.total_escrows),
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.total_escrows),
            parseInt(metrics.previousMetrics.total_escrows)
          )
        },
        avgTransactionAmount: {
          value: parseFloat(metrics.currentMetrics.avg_transaction_amount),
          growth: 0 // Average doesn't have meaningful growth comparison
        }
      }
    });
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch key metrics' 
    });
  }
};

// Get customer acquisition analytics
export const getAcquisitionAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '12m': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await withRetry(async () => {
      // Simulated traffic sources (in real implementation, you'd track these)
      const trafficSources = [
        { source: 'Organic Search', users: Math.floor(Math.random() * 500) + 200, percentage: 0 },
        { source: 'Direct', users: Math.floor(Math.random() * 300) + 150, percentage: 0 },
        { source: 'Social Media', users: Math.floor(Math.random() * 200) + 100, percentage: 0 },
        { source: 'Referrals', users: Math.floor(Math.random() * 150) + 50, percentage: 0 }
      ];
      
      const totalUsers = trafficSources.reduce((sum, source) => sum + source.users, 0);
      trafficSources.forEach(source => {
        source.percentage = (source.users / totalUsers) * 100;
      });

      // Conversion funnel
      const totalVisitors = Math.floor(totalUsers * 1.5);
      const signups = totalUsers;
      const firstTransaction = Math.floor(signups * 0.3);
      const repeatCustomers = Math.floor(firstTransaction * 0.6);

      const conversionFunnel = {
        visitors: totalVisitors,
        signups: signups,
        firstTransaction: firstTransaction,
        repeatCustomers: repeatCustomers,
        conversionRates: {
          visitorToSignup: (signups / totalVisitors) * 100,
          signupToFirstTransaction: (firstTransaction / signups) * 100,
          firstToRepeat: (repeatCustomers / firstTransaction) * 100
        }
      };

      return { trafficSources, conversionFunnel };
    });

    res.json({
      success: true,
      period,
      acquisition: analytics
    });
  } catch (error) {
    console.error('Error fetching acquisition analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch acquisition analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get transaction analytics
export const getPaymentsAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await withRetry(async () => {
      // Payment methods breakdown
      const paymentMethods = await AppDataSource.query(`
        SELECT 
          COALESCE(payment_type, 'Unknown') as payment_method,
          COUNT(*) as count,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_amount,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payment WHERE created_at >= $1), 2) as percentage
        FROM payment 
        WHERE created_at >= $1 AND status = 'completed'
        GROUP BY payment_type
        ORDER BY total_amount DESC
      `, [startDate]);

      // Transaction size analytics
      const [transactionSizes] = await AppDataSource.query(`
        SELECT 
          COALESCE(AVG(CAST(amount AS NUMERIC)), 0) as average_amount,
          COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CAST(amount AS NUMERIC)), 0) as median_amount,
          COALESCE(MAX(CAST(amount AS NUMERIC)), 0) as largest_amount,
          COALESCE(MIN(CAST(amount AS NUMERIC)), 0) as smallest_amount,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_volume,
          COUNT(*) as transaction_count
        FROM payment 
        WHERE created_at >= $1 AND status = 'completed'
      `, [startDate]);

      // Payment status breakdown
      const paymentStatuses = await AppDataSource.query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payment WHERE created_at >= $1), 2) as percentage
        FROM payment 
        WHERE created_at >= $1
        GROUP BY status
        ORDER BY count DESC
      `, [startDate]);

      // Daily payment trends
      const dailyTrends = await AppDataSource.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(amount AS NUMERIC) END), 0) as daily_revenue,
          COUNT(DISTINCT COALESCE(user_id, seller_id)) as unique_users
        FROM payment 
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [startDate]);

      // User payment behavior
      const [userBehavior] = await AppDataSource.query(`
        SELECT 
          COALESCE(AVG(user_total), 0) as avg_user_spending,
          COALESCE(AVG(transaction_count), 0) as avg_transactions_per_user,
          COUNT(DISTINCT user_id) as unique_customers,
          COALESCE(MAX(user_total), 0) as highest_spender_amount
        FROM (
          SELECT 
            COALESCE(user_id, seller_id) as user_id,
            SUM(CASE WHEN status = 'completed' THEN CAST(amount AS NUMERIC) ELSE 0 END) as user_total,
            COUNT(*) as transaction_count
          FROM payment 
          WHERE created_at >= $1
          GROUP BY COALESCE(user_id, seller_id)
        ) user_stats
      `, [startDate]);

      return { paymentMethods, transactionSizes, paymentStatuses, dailyTrends, userBehavior };
    });

    res.json({
      success: true,
      period,
      analytics: {
        paymentMethods: analytics.paymentMethods || [],
        transactionSizes: analytics.transactionSizes || {},
        paymentStatuses: analytics.paymentStatuses || [],
        dailyTrends: analytics.dailyTrends || [],
        userBehavior: analytics.userBehavior || {}
      }
    });
  } catch (error) {
    console.error('Error fetching payments analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments analytics' 
    });
  }
};

// Get growth tracking and KPIs
export const getGrowthKPIs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    const kpis = await withRetry(async () => {
      const [currentPeriod] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 THEN u.id END) as new_customers,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as revenue,
          COUNT(DISTINCT CASE WHEN p.created_at >= $1 THEN COALESCE(p.user_id, p.seller_id) END) as active_customers
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
      `, [startDate]);

      const [previousPeriod] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 AND u.created_at < $2 THEN u.id END) as new_customers,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.created_at < $2 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as revenue,
          COUNT(DISTINCT CASE WHEN p.created_at >= $1 AND p.created_at < $2 THEN COALESCE(p.user_id, p.seller_id) END) as active_customers
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
      `, [previousStartDate, startDate]);

      // Calculate KPIs
      const newCustomers = parseInt(currentPeriod.new_customers);
      const revenue = parseFloat(currentPeriod.revenue);
      const activeCustomers = parseInt(currentPeriod.active_customers);
      
      const previousNewCustomers = parseInt(previousPeriod.new_customers);
      const previousRevenue = parseFloat(previousPeriod.revenue);
      
      // Simulated marketing spend for CAC calculation
      const marketingSpend = revenue * 0.15; // Assume 15% of revenue spent on marketing
      const cac = newCustomers > 0 ? marketingSpend / newCustomers : 0;
      
      // Simulated CLV (in real implementation, calculate from historical data)
      const avgClv = revenue > 0 && activeCustomers > 0 ? (revenue / activeCustomers) * 2.5 : 0;
      
      const ltvCacRatio = cac > 0 ? avgClv / cac : 0;
      const paybackPeriod = cac > 0 && revenue > 0 ? (cac / (revenue / activeCustomers)) : 0;
      
      const monthlyGrowthRate = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        monthlyGrowthRate,
        customerAcquisitionCost: cac,
        ltvCacRatio,
        paybackPeriod,
        trends: {
          revenue: {
            current: revenue,
            previous: previousRevenue,
            growth: previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0
          },
          customers: {
            current: newCustomers,
            previous: previousNewCustomers,
            growth: previousNewCustomers > 0 ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 : 0
          }
        }
      };
    });

    res.json({
      success: true,
      period,
      kpis
    });
  } catch (error) {
    console.error('Error fetching growth KPIs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch growth KPIs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get recent activity feed
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20 } = req.query;

    const activities = await withRetry(async () => {
      const events = await AppDataSource.query(`
        SELECT 
          pe.type,
          pe.description,
          pe.created_at,
          p.amount,
          p.currency,
          u.email as user_email,
          u.full_name as user_name
        FROM payment_event pe
        JOIN payment p ON p.id = pe."paymentId"
        LEFT JOIN "user" u ON u.id = COALESCE(p.user_id, p.seller_id)
        ORDER BY pe.created_at DESC
        LIMIT $1
      `, [parseInt(limit as string)]);

      return events.map((event: any) => ({
        type: event.type,
        description: event.description,
        timestamp: event.created_at,
        amount: parseFloat(event.amount || '0'),
        currency: event.currency || 'MXN',
        user: {
          email: event.user_email,
          name: event.user_name
        }
      }));
    });

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get AI insights and recommendations
export const getAIInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;

    // Simulated AI insights based on data patterns
    const insights = await withRetry(async () => {
      const [metrics] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN p.status = 'failed' THEN p.id END) as failed_payments,
          COUNT(DISTINCT p.id) as total_payments,
          AVG(CAST(p.amount AS NUMERIC)) as avg_transaction_size
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
        WHERE p.created_at >= NOW() - INTERVAL '30 days'
      `);

      const failureRate = metrics.total_payments > 0 ? (metrics.failed_payments / metrics.total_payments) * 100 : 0;
      const avgTransactionSize = parseFloat(metrics.avg_transaction_size || '0');

      const insights = [];

      if (failureRate > 5) {
        insights.push({
          type: 'warning',
          title: 'High Payment Failure Rate',
          description: `Payment failure rate is ${failureRate.toFixed(1)}%. Consider reviewing payment flow and error handling.`,
          priority: 'high',
          actionable: true
        });
      }

      if (avgTransactionSize > 10000) {
        insights.push({
          type: 'opportunity',
          title: 'High-Value Transactions',
          description: `Average transaction size is $${avgTransactionSize.toFixed(2)}. Consider premium customer retention programs.`,
          priority: 'medium',
          actionable: true
        });
      }

      insights.push({
        type: 'insight',
        title: 'Growth Opportunity',
        description: 'Customer acquisition is trending upward. Consider scaling marketing efforts in top-performing channels.',
        priority: 'medium',
        actionable: true
      });

      insights.push({
        type: 'recommendation',
        title: 'Optimize Conversion Funnel',
        description: 'Focus on improving first-transaction conversion rate to maximize customer lifetime value.',
        priority: 'low',
        actionable: true
      });

      return insights;
    });

    res.json({
      success: true,
      period,
      insights
    });
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get trends data for visualization
export const getTrends = async (req: Request, res: Response) => {
  try {
    const { period = '30d', status, type } = req.query;
    
    // Calculate date ranges for trend data
    const now = new Date();
    let startDate: Date;
    let intervals: number;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervals = 7;
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervals = 30;
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        intervals = 30; // Show 30 data points for 90 days
        break;
      case '12m':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        intervals = 12; // Show 12 months
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        intervals = 30;
    }

    // Build filter conditions
    const statusFilter = status && status !== 'all' ? `AND p.status = '${status}'` : '';
    const typeFilter = type && type !== 'all' ? `AND p.type = '${type}'` : '';

    const trends = await withRetry(async () => {
      // Generate trend data points
      const trendData = [];
      const intervalMs = (now.getTime() - startDate.getTime()) / intervals;
      
      for (let i = 0; i < intervals; i++) {
        const intervalStart = new Date(startDate.getTime() + i * intervalMs);
        const intervalEnd = new Date(startDate.getTime() + (i + 1) * intervalMs);
        
        const [metrics] = await AppDataSource.query(`
          SELECT 
            COUNT(DISTINCT CASE WHEN u.created_at >= $1 AND u.created_at < $2 THEN u.id END) as users,
            COUNT(CASE WHEN p.created_at >= $1 AND p.created_at < $2 ${statusFilter} ${typeFilter} THEN p.id END) as payments,
            COUNT(CASE WHEN e.created_at >= $1 AND e.created_at < $2 THEN e.id END) as escrows,
            COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.created_at < $2 AND p.status = 'completed' ${typeFilter} THEN CAST(p.amount AS NUMERIC) END), 0) as revenue
          FROM "user" u
          LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
          LEFT JOIN escrow e ON e.payment_id = p.id
        `, [intervalStart, intervalEnd]);
        
        trendData.push({
          date: intervalStart.toISOString().split('T')[0],
          users: parseInt(metrics.users) || 0,
          payments: parseInt(metrics.payments) || 0,
          escrows: parseInt(metrics.escrows) || 0,
          revenue: parseFloat(metrics.revenue) || 0
        });
      }
      
      return trendData;
    });

    res.json({
      success: true,
      trends,
      period,
      filters: { status, type }
    });
  } catch (error: any) {
    console.error('Get trends error:', error);
    res.status(500).json({ 
      error: 'Failed to get trends data',
      details: error.message 
    });
  }
};

// Export analytics report as CSV
export const exportAnalyticsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30', format = 'csv' } = req.query;
    
    if (format !== 'csv') {
      res.status(400).json({ error: 'Only CSV format is supported' });
      return;
    }

    // Get all analytics data
    const [keyMetrics, transactions, growthKPIs] = await Promise.all([
      getKeyMetricsData(period as string),
      getTransactionData(period as string),
      getGrowthKPIsData(period as string)
    ]);

    // Generate CSV content
    const csvContent = generateCSVReport({
      keyMetrics,
      transactions,
      growthKPIs,
      period: period as string
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=kustodia-analytics-${period}days-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting analytics report:', error);
    res.status(500).json({ 
      error: 'Failed to export analytics report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



// Helper functions for data extraction (used by export)
const getKeyMetricsData = async (period: string) => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case '7':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '365':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [currentMetrics] = await AppDataSource.query(`
    SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT CASE WHEN u.created_at >= $1 THEN u.id END) as new_acquisitions,
      COUNT(DISTINCT CASE WHEN p.created_at >= $1 THEN COALESCE(p.user_id, p.seller_id) END) as active_transactors,
      COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as total_revenue
    FROM "user" u
    LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
  `, [startDate]);

  return currentMetrics;
};

const getTransactionData = async (period: string) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

  const [transactionSizes] = await AppDataSource.query(`
    SELECT 
      AVG(CAST(amount AS NUMERIC)) as average_size,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CAST(amount AS NUMERIC)) as median_size,
      MAX(CAST(amount AS NUMERIC)) as largest_size,
      SUM(CAST(amount AS NUMERIC)) as total_volume,
      COUNT(*) as transaction_count
    FROM payment 
    WHERE created_at >= $1 AND status = 'completed'
  `, [startDate]);

  return transactionSizes;
};

const getGrowthKPIsData = async (period: string) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

  const [kpis] = await AppDataSource.query(`
    SELECT 
      COUNT(DISTINCT CASE WHEN u.created_at >= $1 THEN u.id END) as new_customers,
      COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as revenue
    FROM "user" u
    LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
  `, [startDate]);

  return kpis;
};

const generateCSVReport = (data: any) => {
  const { keyMetrics, transactions, growthKPIs, period } = data;
  
  let csv = `Kustodia Analytics Report - ${period} days\n`;
  csv += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Key Metrics
  csv += `KEY METRICS\n`;
  csv += `Total Users,${keyMetrics.total_users}\n`;
  csv += `New Acquisitions,${keyMetrics.new_acquisitions}\n`;
  csv += `Active Transactors,${keyMetrics.active_transactors}\n`;
  csv += `Total Revenue,${keyMetrics.total_revenue}\n\n`;
  
  // Transaction Data
  csv += `TRANSACTION METRICS\n`;
  csv += `Average Transaction Size,${transactions.average_size || 0}\n`;
  csv += `Median Transaction Size,${transactions.median_size || 0}\n`;
  csv += `Largest Transaction,${transactions.largest_size || 0}\n`;
  csv += `Total Volume,${transactions.total_volume || 0}\n`;
  csv += `Transaction Count,${transactions.transaction_count || 0}\n\n`;
  
  // Growth KPIs
  csv += `GROWTH KPIS\n`;
  csv += `New Customers,${growthKPIs.new_customers}\n`;
  csv += `Revenue,${growthKPIs.revenue}\n`;
  
  return csv;
};
