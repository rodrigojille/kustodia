import { Request, Response, NextFunction } from 'express';
import { BlacklistService } from '../services/BlacklistService';
import { BlacklistType } from '../entity/Blacklist';
import AppDataSource from '../ormconfig';
import { User } from '../entity/User';

export interface BlacklistRequest extends Request {
  user?: any;
  blacklistCheck?: {
    isBlacklisted: boolean;
    reason?: string;
    description?: string;
  };
}

/**
 * Middleware to check if user is blacklisted
 */
export const checkUserBlacklist = async (
  req: BlacklistRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blacklistService = new BlacklistService();
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return next();
    }

    // Get full user details
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check blacklist status
    const blacklistResult = await blacklistService.checkUserBlacklist(user);
    
    if (blacklistResult.isBlacklisted) {
      console.log(`[BLACKLIST] Blocked access for user ${user.id} (${user.email}) - Reason: ${blacklistResult.reason}`);
      
      res.status(403).json({
        success: false,
        message: 'Access denied: Account has been restricted due to compliance requirements',
        error_code: 'ACCOUNT_BLACKLISTED',
        details: {
          reason: blacklistResult.reason,
          description: blacklistResult.description || 'Please contact support for more information'
        }
      });
      return;
    }

    // Store blacklist check result for potential use in controllers
    req.blacklistCheck = {
      isBlacklisted: false
    };

    next();
  } catch (error) {
    console.error('[BLACKLIST] Error checking blacklist:', error);
    
    // In case of error, allow the request to proceed but log the issue
    // This prevents blacklist service issues from breaking the entire system
    req.blacklistCheck = {
      isBlacklisted: false
    };
    
    next();
  }
};

/**
 * Middleware to check if a wallet address is blacklisted
 */
export const checkWalletBlacklist = async (
  req: BlacklistRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blacklistService = new BlacklistService();
    const walletAddress = req.body.wallet_address || req.body.seller_wallet || req.body.payer_wallet;
    
    if (!walletAddress) {
      return next();
    }

    const blacklistResult = await blacklistService.checkBlacklist(
      BlacklistType.WALLET_ADDRESS,
      walletAddress
    );
    
    if (blacklistResult.isBlacklisted) {
      console.log(`[BLACKLIST] Blocked wallet address ${walletAddress} - Reason: ${blacklistResult.reason}`);
      
      res.status(403).json({
        success: false,
        message: 'Transaction denied: Wallet address has been flagged for compliance review',
        error_code: 'WALLET_BLACKLISTED',
        details: {
          reason: blacklistResult.reason,
          description: blacklistResult.description || 'Please contact support for more information'
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[BLACKLIST] Error checking wallet blacklist:', error);
    next();
  }
};

/**
 * Middleware to check if an email is blacklisted
 */
export const checkEmailBlacklist = async (
  req: BlacklistRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blacklistService = new BlacklistService();
    const email = req.body.email;
    
    if (!email) {
      return next();
    }

    const blacklistResult = await blacklistService.checkBlacklist(
      BlacklistType.EMAIL,
      email
    );
    
    if (blacklistResult.isBlacklisted) {
      console.log(`[BLACKLIST] Blocked email ${email} - Reason: ${blacklistResult.reason}`);
      
      res.status(403).json({
        success: false,
        message: 'Registration denied: Email address has been restricted',
        error_code: 'EMAIL_BLACKLISTED',
        details: {
          reason: blacklistResult.reason,
          description: blacklistResult.description || 'Please contact support for more information'
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[BLACKLIST] Error checking email blacklist:', error);
    next();
  }
};

/**
 * Middleware to check IP address blacklist
 */
export const checkIPBlacklist = async (
  req: BlacklistRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blacklistService = new BlacklistService();
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
    
    if (!clientIP) {
      return next();
    }

    // Handle multiple IPs in x-forwarded-for header
    const ipAddress = Array.isArray(clientIP) ? clientIP[0] : clientIP.split(',')[0].trim();

    const blacklistResult = await blacklistService.checkBlacklist(
      BlacklistType.IP_ADDRESS,
      ipAddress
    );
    
    if (blacklistResult.isBlacklisted) {
      console.log(`[BLACKLIST] Blocked IP address ${ipAddress} - Reason: ${blacklistResult.reason}`);
      
      res.status(403).json({
        success: false,
        message: 'Access denied: IP address has been restricted',
        error_code: 'IP_BLACKLISTED',
        details: {
          reason: blacklistResult.reason,
          description: blacklistResult.description || 'Please contact support for more information'
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[BLACKLIST] Error checking IP blacklist:', error);
    next();
  }
};

/**
 * Combined middleware for comprehensive blacklist checking
 */
export const comprehensiveBlacklistCheck = [
  checkIPBlacklist,
  checkUserBlacklist,
  checkWalletBlacklist,
  checkEmailBlacklist
];
