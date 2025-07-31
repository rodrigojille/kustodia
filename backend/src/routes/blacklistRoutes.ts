import { Router } from 'express';
import { BlacklistController } from '../controllers/blacklistController';
import { authenticateJWT } from '../authenticateJWT';
import { checkUserBlacklist } from '../middleware/blacklistMiddleware';

const router = Router();
const blacklistController = new BlacklistController();

// Middleware to ensure only admins can manage blacklist
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Middleware to ensure only compliance officers can manage blacklist
const requireComplianceOfficer = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'compliance_officer')) {
    return res.status(403).json({
      success: false,
      message: 'Compliance officer access required'
    });
  }
  next();
};

// Public routes (for checking status)
/**
 * @route GET /api/blacklist/check
 * @desc Check if identifier is blacklisted
 * @access Public (for internal system checks)
 * @query type - BlacklistType (user, wallet_address, email, ip_address)
 * @query identifier - The identifier to check
 */
router.get('/check', blacklistController.checkBlacklist);

/**
 * @route GET /api/blacklist/user-status
 * @desc Check current user's blacklist status
 * @access Private
 */
router.get('/user-status', authenticateJWT, blacklistController.checkUserStatus);

// Admin/Compliance Officer routes
/**
 * @route POST /api/blacklist
 * @desc Add entry to blacklist
 * @access Admin/Compliance Officer
 * @body type, identifier, reason, description?, referenceNumber?, source?, expiryDate?
 */
router.post('/', authenticateJWT, requireComplianceOfficer, blacklistController.addToBlacklist);

/**
 * @route DELETE /api/blacklist/:id
 * @desc Remove entry from blacklist
 * @access Admin/Compliance Officer
 * @param id - Blacklist entry ID
 * @body reviewNotes? - Optional review notes
 */
router.delete('/:id', authenticateJWT, requireComplianceOfficer, blacklistController.removeFromBlacklist);

/**
 * @route GET /api/blacklist
 * @desc Get all active blacklist entries
 * @access Admin/Compliance Officer
 */
router.get('/', authenticateJWT, requireComplianceOfficer, blacklistController.getActiveBlacklist);

/**
 * @route GET /api/blacklist/type/:type
 * @desc Get blacklist entries by type
 * @access Admin/Compliance Officer
 * @param type - BlacklistType
 */
router.get('/type/:type', authenticateJWT, requireComplianceOfficer, blacklistController.getBlacklistByType);

/**
 * @route GET /api/blacklist/search
 * @desc Search blacklist entries
 * @access Admin/Compliance Officer
 * @query query - Search query
 */
router.get('/search', authenticateJWT, requireComplianceOfficer, blacklistController.searchBlacklist);

/**
 * @route GET /api/blacklist/stats
 * @desc Get blacklist statistics
 * @access Admin/Compliance Officer
 */
router.get('/stats', authenticateJWT, requireComplianceOfficer, blacklistController.getBlacklistStats);

/**
 * @route POST /api/blacklist/bulk-check
 * @desc Bulk check multiple identifiers
 * @access Admin/Compliance Officer
 * @body identifiers - Array of {type, value} objects
 */
router.post('/bulk-check', authenticateJWT, requireComplianceOfficer, blacklistController.bulkCheckBlacklist);

/**
 * @route POST /api/blacklist/cleanup
 * @desc Clean up expired blacklist entries
 * @access Admin
 */
router.post('/cleanup', authenticateJWT, requireAdmin, blacklistController.cleanupExpiredEntries);

export default router;
