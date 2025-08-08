import { Request, Response } from "express";
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { Escrow } from '../entity/Escrow';
import { PaymentEvent } from '../entity/PaymentEvent';
import { Dispute } from '../entity/Dispute';
import AppDataSource from '../ormconfig';
import { Between, LessThan, MoreThan, IsNull } from 'typeorm';
import { ethers } from 'ethers';
import { createHmac } from 'crypto';
import axios from 'axios';
import { getCurrentNetworkConfig } from '../utils/networkConfig';

const JUNO_API_KEY = process.env.JUNO_API_KEY;
const JUNO_API_SECRET = process.env.JUNO_API_SECRET;
const JUNO_BASE_URL = process.env.JUNO_BASE_URL || 'https://api.juno.com';

// Utility to get Juno API credentials from env

// =============================================================================
// 🎯 PAYMENT OPERATIONS CONTROL ROOM
// =============================================================================

// --- Dispute Management ---
export const getAllDisputes = async (req: Request, res: Response): Promise<void> => {
  const disputeRepo = AppDataSource.getRepository(Dispute);
  const userRepo = AppDataSource.getRepository(User);
  const escrowRepo = AppDataSource.getRepository(Escrow);
  const disputes = await disputeRepo.find({ 
    relations: ["escrow", "raisedBy", "escrow.payment"] 
  });
  res.json({ disputes });
}

// --- User Management ---
export const getAllUsersWithDetails = async (req: Request, res: Response): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find();
  // Optionally, fetch balances and clabes here
  res.json({ users });
}

export const getUserClabes = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  // Fetch CLABEs from DB and Juno API
  // DB fetch (assume User has clabe field or related entity)
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: Number(userId) } });
  // Collect both deposit and payout CLABEs
  let dbClabes: string[] = [];
  if (user?.deposit_clabe) dbClabes.push(user.deposit_clabe);
  if (user?.payout_clabe) dbClabes.push(user.payout_clabe);
  // Juno API fetch
  let junoClabes = [];
  if (JUNO_API_KEY && JUNO_API_SECRET) {
    try {
      const resp = await axios.get(`${JUNO_BASE_URL}/v1/clabes`, {
        headers: { 'Authorization': `Bearer ${JUNO_API_KEY}` }
      });
      junoClabes = resp.data?.clabes?.filter((c: any) => c.user_id == userId) || [];
    } catch (err) {
      // Log or handle
    }
  }
  res.json({ dbClabes, junoClabes });
}

export const getUserDeposits = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  // Fetch deposits from DB and Juno API
  // DB fetch (assume Escrow has deposits or related entity)
  const escrowRepo = ormconfig.getRepository(Escrow);
  // Assuming Escrow -> Payment -> User
  // Fetch escrows where payment.user.id = userId
  const dbDeposits = await escrowRepo.find({
    relations: ['payment', 'payment.user'],
    where: { payment: { user: { id: Number(userId) } } }
  });
  // Juno API fetch
  let junoDeposits = [];
  if (JUNO_API_KEY && JUNO_API_SECRET) {
    try {
      const resp = await axios.get(`${JUNO_BASE_URL}/v1/deposits`, {
        headers: { 'Authorization': `Bearer ${JUNO_API_KEY}` }
      });
      junoDeposits = resp.data?.deposits?.filter((d: any) => d.user_id == userId) || [];
    } catch (err) {
      // Log or handle
    }
  }
  res.json({ dbDeposits, junoDeposits });
}

// =============================================================================
// 🎯 PAYMENT ANALYTICS & MONITORING
// =============================================================================

export const getPaymentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const userRepo = AppDataSource.getRepository(User);

    // Date filters
    const { timeframe = '30d' } = req.query;
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 📊 Payment Volume Analytics
    const paymentStats = await ormconfig.query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'escrowed' THEN 1 END) as escrowed_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_volume,
        COALESCE(AVG(CAST(amount AS NUMERIC)), 0) as avg_payment_amount,
        COUNT(CASE WHEN payout_juno_bank_account_id IS NULL THEN 1 END) as missing_juno_uuids
      FROM payment 
      WHERE created_at >= $1
    `, [startDate]);

    // 🔄 Escrow Status Distribution
    const escrowStats = await ormconfig.query(`
      SELECT 
        e.status,
        COUNT(*) as count,
        COALESCE(SUM(CAST(p.amount AS NUMERIC)), 0) as total_amount
      FROM escrow e
      LEFT JOIN payment p ON p.escrow_id = e.id
      WHERE p.created_at >= $1
      GROUP BY e.status
      ORDER BY count DESC
    `, [startDate]);

    // 🏦 Juno Integration Health
    const junoHealth = await ormconfig.query(`
      SELECT 
        COUNT(CASE WHEN payout_juno_bank_account_id IS NOT NULL THEN 1 END) as payments_with_juno_uuid,
        COUNT(CASE WHEN payout_juno_bank_account_id IS NULL THEN 1 END) as payments_missing_juno_uuid,
        COUNT(CASE WHEN juno_payment_id IS NOT NULL THEN 1 END) as juno_processed_payments
      FROM payment
      WHERE created_at >= $1
    `, [startDate]);

    // 👥 User Activity
    const userStats = await ormconfig.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_buyers,
        COUNT(DISTINCT seller_id) as active_sellers,
        COUNT(DISTINCT CASE WHEN juno_bank_account_id IS NOT NULL THEN id END) as users_with_juno
      FROM payment p
      LEFT JOIN "user" u ON u.id = p.user_id OR u.id = p.seller_id
      WHERE p.created_at >= $1
    `, [startDate]);

    // 📈 Daily Transaction Trends
    const dailyTrends = await ormconfig.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as daily_volume,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM payment
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [startDate]);

    res.json({
      success: true,
      timeframe,
      analytics: {
        payment_stats: paymentStats[0],
        escrow_distribution: escrowStats,
        juno_health: junoHealth[0],
        user_activity: userStats[0],
        daily_trends: dailyTrends
      }
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
};

// =============================================================================
// 🔍 ADVANCED PAYMENT SEARCH & TROUBLESHOOTING
// =============================================================================

export const searchPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query,
      status,
      escrow_status,
      date_from,
      date_to,
      amount_min,
      amount_max,
      missing_juno_uuid,
      user_email,
      reference,
      page = 1,
      limit = 50
    } = req.query;

    let sql = `
      SELECT 
        p.id, p.recipient_email, p.payer_email, p.amount, p.currency,
        p.status, p.reference, p.created_at, p.updated_at,
        p.payout_juno_bank_account_id, p.juno_payment_id,
        u_buyer.email as buyer_email, u_buyer.full_name as buyer_name,
        u_seller.email as seller_email, u_seller.full_name as seller_name,
        e.status as escrow_status, e.smart_contract_escrow_id,
        CASE WHEN p.payout_juno_bank_account_id IS NULL THEN true ELSE false END as missing_juno_uuid
      FROM payment p
      LEFT JOIN "user" u_buyer ON u_buyer.id = p.user_id  
      LEFT JOIN "user" u_seller ON u_seller.id = p.seller_id
      LEFT JOIN escrow e ON e.id = p.escrow_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Search filters
    if (query) {
      sql += ` AND (p.recipient_email ILIKE $${paramIndex} OR p.payer_email ILIKE $${paramIndex} OR p.reference ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (status) {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (escrow_status) {
      sql += ` AND e.status = $${paramIndex}`;
      params.push(escrow_status);
      paramIndex++;
    }

    if (missing_juno_uuid === 'true') {
      sql += ` AND p.payout_juno_bank_account_id IS NULL`;
    }

    if (date_from) {
      sql += ` AND p.created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      sql += ` AND p.created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    if (amount_min) {
      sql += ` AND CAST(p.amount AS NUMERIC) >= $${paramIndex}`;
      params.push(parseFloat(amount_min as string));
      paramIndex++;
    }

    if (amount_max) {
      sql += ` AND CAST(p.amount AS NUMERIC) <= $${paramIndex}`;
      params.push(parseFloat(amount_max as string));
      paramIndex++;
    }

    // Count total for pagination
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await ormconfig.query(countSql, params);
    const total = parseInt(countResult[0].total);

    // Add pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), offset);

    const payments = await ormconfig.query(sql, params);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Payment search error:', error);
    res.status(500).json({ error: 'Failed to search payments' });
  }
};

// =============================================================================
// 🛠️ PAYMENT TROUBLESHOOTING & FIXES
// =============================================================================

export const getPaymentHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 Critical Issues Detection
    const criticalIssues = await ormconfig.query(`
      SELECT 
        'Missing Juno UUID' as issue_type,
        COUNT(*) as count,
        'Payments missing payout_juno_bank_account_id will be skipped by automation' as description
      FROM payment 
      WHERE payout_juno_bank_account_id IS NULL AND status = 'escrowed'
      
      UNION ALL
      
      SELECT 
        'Missing Seller Relationship' as issue_type,
        COUNT(*) as count,
        'Payments without seller_id cannot be processed' as description
      FROM payment 
      WHERE seller_id IS NULL
      
      UNION ALL
      
      SELECT 
        'Orphaned Escrows' as issue_type,
        COUNT(*) as count,
        'Escrows in released status but payment not completed' as description
      FROM payment p
      JOIN escrow e ON e.id = p.escrow_id
      WHERE e.status = 'released' AND p.status != 'completed'
      
      UNION ALL
      
      SELECT 
        'Stale Pending Payments' as issue_type,
        COUNT(*) as count,
        'Payments pending for more than 24 hours' as description
      FROM payment 
      WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours'
    `);

    // 🔍 Automation Readiness Check
    const automationReadiness = await ormconfig.query(`
      SELECT 
        COUNT(CASE WHEN e.status = 'released' AND p.payout_juno_bank_account_id IS NOT NULL THEN 1 END) as ready_for_automation,
        COUNT(CASE WHEN e.status = 'released' AND p.payout_juno_bank_account_id IS NULL THEN 1 END) as blocked_automation,
        COUNT(CASE WHEN e.status = 'funded' THEN 1 END) as awaiting_release
      FROM payment p
      LEFT JOIN escrow e ON e.id = p.escrow_id
      WHERE p.status = 'escrowed'
    `);

    // 📊 Recent Activity Summary
    const recentActivity = await ormconfig.query(`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as payment_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM payment 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY hour DESC
    `);

    res.json({
      success: true,
      health_check: {
        critical_issues: criticalIssues.filter((issue: any) => issue.count > 0),
        automation_readiness: automationReadiness[0],
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Payment health check error:', error);
    res.status(500).json({ error: 'Failed to check payment health' });
  }
};

// =============================================================================
// 🔧 BULK OPERATIONS & FIXES
// =============================================================================

export const bulkFixMissingUUIDs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payment_ids, fix_type } = req.body;

    if (fix_type === 'seller_uuid') {
      // Fix missing seller UUIDs
      const result = await ormconfig.query(`
        UPDATE payment 
        SET payout_juno_bank_account_id = u.juno_bank_account_id
        FROM "user" u
        WHERE payment.seller_id = u.id 
        AND payment.payout_juno_bank_account_id IS NULL
        AND u.juno_bank_account_id IS NOT NULL
        ${payment_ids ? 'AND payment.id = ANY($1)' : ''}
      `, payment_ids ? [payment_ids] : []);

      res.json({ 
        success: true, 
        message: `Fixed UUIDs for payments using seller relationships`,
        affected_rows: result[1] // PostgreSQL returns [result, count]
      });
    } else {
      res.status(400).json({ error: 'Invalid fix_type' });
    }
  } catch (error) {
    console.error('Bulk fix error:', error);
    res.status(500).json({ error: 'Failed to apply bulk fix' });
  }
};

// =============================================================================
// 🏦 JUNO API MONITORING
// =============================================================================

export const getJunoApiStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthChecks = {
      api_credentials: !!JUNO_API_KEY && !!JUNO_API_SECRET,
      api_reachable: false,
      last_successful_call: null,
      error_rate_24h: 0
    };

    // Test API connectivity
    if (healthChecks.api_credentials) {
      try {
        // Simple ping to Juno API
        const response = await axios.get(`${JUNO_BASE_URL}/health`, {
          headers: { 'Authorization': `Bearer ${JUNO_API_KEY}` },
          timeout: 5000
        });
        healthChecks.api_reachable = response.status === 200;
      } catch (error) {
        healthChecks.api_reachable = false;
      }
    }

    // Get recent Juno-related errors from logs (if you have error logging)
    // This would typically query your error logging table
    
    res.json({ 
      success: true, 
      juno_status: healthChecks 
    });
  } catch (error) {
    console.error('Juno API status error:', error);
    res.status(500).json({ error: 'Failed to check Juno API status' });
  }
};

// =============================================================================
// 📊 USER ANALYTICS & MANAGEMENT  
// =============================================================================

export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = '30d' } = req.query;
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const userStats = await ormconfig.query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN p.user_id IS NOT NULL THEN u.id END) as active_buyers,
        COUNT(DISTINCT CASE WHEN p.seller_id IS NOT NULL THEN u.id END) as active_sellers,
        COUNT(DISTINCT CASE WHEN u.juno_bank_account_id IS NOT NULL THEN u.id END) as users_with_juno,
        COUNT(DISTINCT CASE WHEN u.kyc_status = 'approved' THEN u.id END) as kyc_approved_users,
        AVG(payment_count.count) as avg_payments_per_user
      FROM "user" u
      LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id) AND p.created_at >= $1
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as count 
        FROM payment p2 
        WHERE (p2.user_id = u.id OR p2.seller_id = u.id) AND p2.created_at >= $1
      ) payment_count ON true
      WHERE u.created_at >= $1
    `, [startDate]);

    const topUsers = await ormconfig.query(`
      SELECT 
        u.id, u.email, u.full_name, u.kyc_status,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(CAST(p.amount AS NUMERIC)), 0) as total_volume,
        MAX(p.created_at) as last_payment_date
      FROM "user" u
      LEFT JOIN payment p ON (p.user_id = u.id OR p.seller_id = u.id)
      WHERE p.created_at >= $1
      GROUP BY u.id, u.email, u.full_name, u.kyc_status
      ORDER BY total_volume DESC
      LIMIT 20
    `, [startDate]);

    res.json({
      success: true,
      timeframe,
      user_analytics: {
        summary: userStats[0],
        top_users: topUsers
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

// =============================================================================
// 🎯 LEGACY ADMIN FUNCTIONS (PRESERVED)
// =============================================================================

// Legacy function - preserved for backward compatibility
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payments = await paymentRepo.find({ 
      relations: ["user", "escrow"],
      order: { created_at: "DESC" },
      take: 1000 // Limit to prevent memory issues
    });
    
    // Return array directly for frontend compatibility
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// =============================================================================
// 💰 BRIDGE WALLET BALANCE MONITORING
// =============================================================================

export const getBridgeWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const networkConfig = getCurrentNetworkConfig();
    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    const tokenAddress = networkConfig.mxnbTokenAddress;
    const bridgeWallet = networkConfig.bridgeWallet;
    
    const ERC20_ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)"
    ];
    
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals, symbol, name] = await Promise.all([
      token.balanceOf(bridgeWallet),
      token.decimals(),
      token.symbol(),
      token.name()
    ]);
    
    const formattedBalance = ethers.formatUnits(balance, decimals);
    const balanceNumber = parseFloat(formattedBalance);
    
    // Get ETH balance too for gas monitoring
    const ethBalance = await provider.getBalance(bridgeWallet);
    const formattedEthBalance = ethers.formatEther(ethBalance);
    
    res.json({
      success: true,
      bridgeWallet,
      mxnb: {
        balance: balanceNumber,
        formattedBalance,
        rawBalance: balance.toString(),
        decimals: Number(decimals),
        symbol,
        name,
        contractAddress: tokenAddress
      },
      eth: {
        balance: parseFloat(formattedEthBalance),
        formattedBalance: formattedEthBalance,
        rawBalance: ethBalance.toString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching bridge wallet balance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch bridge wallet balance',
      details: error.message 
    });
  }
};
