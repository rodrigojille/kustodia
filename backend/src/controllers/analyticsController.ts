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
export const getKeyMetrics = async (req: Request, res: Response): Promise<void> => {
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

    const metrics = await withRetry(async () => {
      const [currentMetrics] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 THEN u.id END) as new_acquisitions,
          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL AND p.created_at >= $1 THEN COALESCE(p.user_id, p.seller_id) END) as active_transactors,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as total_revenue
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
      `, [startDate]);

      const [previousMetrics] = await AppDataSource.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.created_at >= $1 AND u.created_at < $2 THEN u.id END) as new_acquisitions,
          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL AND p.created_at >= $1 AND p.created_at < $2 THEN COALESCE(p.user_id, p.seller_id) END) as active_transactors,
          COALESCE(SUM(CASE WHEN p.created_at >= $1 AND p.created_at < $2 AND p.status = 'completed' THEN CAST(p.amount AS NUMERIC) END), 0) as total_revenue
        FROM "user" u
        LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
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
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.total_users),
            parseInt(metrics.previousMetrics.total_users)
          )
        },
        newAcquisitions: {
          value: parseInt(metrics.currentMetrics.new_acquisitions),
          growth: calculateGrowth(
            parseInt(metrics.currentMetrics.new_acquisitions),
            parseInt(metrics.previousMetrics.new_acquisitions)
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
        }
      }
    });
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch key metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
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
export const getTransactionAnalytics = async (req: Request, res: Response): Promise<void> => {
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
      // Payment method distribution
      const paymentMethods = await AppDataSource.query(`
        SELECT 
          CASE 
            WHEN payment_type = 'bank_transfer' THEN 'Bank Transfer'
            WHEN payment_type = 'card' THEN 'Credit Cards'
            WHEN payment_type = 'digital_wallet' THEN 'Digital Wallets'
            ELSE 'Other'
          END as method,
          COUNT(*) as count,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as volume
        FROM payment 
        WHERE created_at >= $1 AND status = 'completed'
        GROUP BY payment_type
      `, [startDate]);

      // Transaction size metrics
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

      // Customer Lifetime Value metrics
      const [clvMetrics] = await AppDataSource.query(`
        SELECT 
          AVG(user_metrics.total_spent) as avg_clv,
          AVG(user_metrics.transaction_count) as avg_transactions_per_user,
          COUNT(CASE WHEN user_metrics.transaction_count > 1 THEN 1 END) * 100.0 / COUNT(*) as retention_rate
        FROM (
          SELECT 
            COALESCE(p.user_id, p.seller_id) as user_id,
            SUM(CAST(p.amount AS NUMERIC)) as total_spent,
            COUNT(p.id) as transaction_count
          FROM payment p
          WHERE p.created_at >= $1 AND p.status = 'completed'
          GROUP BY COALESCE(p.user_id, p.seller_id)
        ) user_metrics
      `, [startDate]);

      // Calculate totals for percentages
      const totalPaymentCount = paymentMethods.reduce((sum: number, method: any) => sum + parseInt(method.count), 0);
      const paymentMethodsWithPercentage = paymentMethods.map((method: any) => ({
        ...method,
        percentage: totalPaymentCount > 0 ? (parseInt(method.count) / totalPaymentCount) * 100 : 0
      }));

      return {
        paymentMethods: paymentMethodsWithPercentage,
        transactionSizes: {
          average: parseFloat(transactionSizes.average_size || '0'),
          median: parseFloat(transactionSizes.median_size || '0'),
          largest: parseFloat(transactionSizes.largest_size || '0'),
          totalVolume: parseFloat(transactionSizes.total_volume || '0'),
          count: parseInt(transactionSizes.transaction_count || '0')
        },
        customerLifetimeValue: {
          averageClv: parseFloat(clvMetrics.avg_clv || '0'),
          retentionRate: parseFloat(clvMetrics.retention_rate || '0'),
          avgTransactionsPerUser: parseFloat(clvMetrics.avg_transactions_per_user || '0'),
          churnRate: 100 - parseFloat(clvMetrics.retention_rate || '0')
        }
      };
    });

    res.json({
      success: true,
      period,
      transactions: analytics
    });
  } catch (error) {
    console.error('Error fetching transaction analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
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
