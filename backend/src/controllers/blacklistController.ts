import { Request, Response } from 'express';
import { BlacklistService } from '../services/BlacklistService';
import { BlacklistType, BlacklistReason, BlacklistStatus } from '../entity/Blacklist';
import AppDataSource from '../ormconfig';
import { User } from '../entity/User';

export class BlacklistController {
  private blacklistService: BlacklistService;

  constructor() {
    this.blacklistService = new BlacklistService();
  }

  /**
   * Add entry to blacklist
   */
  addToBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        type,
        identifier,
        reason,
        description,
        referenceNumber,
        source,
        expiryDate
      } = req.body;

      // Validate required fields
      if (!type || !identifier || !reason) {
        res.status(400).json({
          success: false,
          message: 'Type, identifier, and reason are required'
        });
        return;
      }

      // Validate enum values
      if (!Object.values(BlacklistType).includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blacklist type',
          validTypes: Object.values(BlacklistType)
        });
        return;
      }

      if (!Object.values(BlacklistReason).includes(reason)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blacklist reason',
          validReasons: Object.values(BlacklistReason)
        });
        return;
      }

      const blacklistEntry = await this.blacklistService.addToBlacklist({
        type,
        identifier,
        reason,
        description,
        referenceNumber,
        source,
        addedByUserId: (req.user as User)?.id,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined
      });

      res.status(201).json({
        success: true,
        message: 'Entry added to blacklist successfully',
        data: blacklistEntry
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error adding to blacklist:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add to blacklist'
      });
    }
  };

  /**
   * Remove entry from blacklist
   */
  removeFromBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'Valid blacklist entry ID is required'
        });
        return;
      }

      await this.blacklistService.removeFromBlacklist(
        Number(id),
        (req.user as User)?.id,
        reviewNotes
      );

      res.json({
        success: true,
        message: 'Entry removed from blacklist successfully'
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error removing from blacklist:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove from blacklist'
      });
    }
  };

  /**
   * Check if identifier is blacklisted
   */
  checkBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, identifier } = req.query;

      if (!type || !identifier) {
        res.status(400).json({
          success: false,
          message: 'Type and identifier are required'
        });
        return;
      }

      if (!Object.values(BlacklistType).includes(type as BlacklistType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blacklist type',
          validTypes: Object.values(BlacklistType)
        });
        return;
      }

      const result = await this.blacklistService.checkBlacklist(
        type as BlacklistType,
        identifier as string
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error checking blacklist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check blacklist'
      });
    }
  };

  /**
   * Get all active blacklist entries
   */
  getActiveBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const entries = await this.blacklistService.getActiveBlacklist();

      res.json({
        success: true,
        data: entries,
        count: entries.length
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error getting active blacklist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blacklist entries'
      });
    }
  };

  /**
   * Get blacklist entries by type
   */
  getBlacklistByType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;

      if (!Object.values(BlacklistType).includes(type as BlacklistType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blacklist type',
          validTypes: Object.values(BlacklistType)
        });
        return;
      }

      const entries = await this.blacklistService.getBlacklistByType(type as BlacklistType);

      res.json({
        success: true,
        data: entries,
        count: entries.length
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error getting blacklist by type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blacklist entries'
      });
    }
  };

  /**
   * Search blacklist entries
   */
  searchBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const entries = await this.blacklistService.searchBlacklist(query as string);

      res.json({
        success: true,
        data: entries,
        count: entries.length
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error searching blacklist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search blacklist'
      });
    }
  };

  /**
   * Get blacklist statistics
   */
  getBlacklistStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.blacklistService.getBlacklistStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error getting blacklist stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blacklist statistics'
      });
    }
  };

  /**
   * Bulk check multiple identifiers
   */
  bulkCheckBlacklist = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifiers } = req.body;

      if (!Array.isArray(identifiers) || identifiers.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Array of identifiers is required'
        });
        return;
      }

      // Validate each identifier
      for (const identifier of identifiers) {
        if (!identifier.type || !identifier.value) {
          res.status(400).json({
            success: false,
            message: 'Each identifier must have type and value'
          });
          return;
        }

        if (!Object.values(BlacklistType).includes(identifier.type)) {
          res.status(400).json({
            success: false,
            message: `Invalid blacklist type: ${identifier.type}`,
            validTypes: Object.values(BlacklistType)
          });
          return;
        }
      }

      const results = await this.blacklistService.bulkCheckBlacklist(identifiers);

      // Convert Map to Object for JSON response
      const resultsObject = Object.fromEntries(results);

      res.json({
        success: true,
        data: resultsObject
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error bulk checking blacklist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk check blacklist'
      });
    }
  };

  /**
   * Clean up expired blacklist entries
   */
  cleanupExpiredEntries = async (req: Request, res: Response): Promise<void> => {
    try {
      const cleanedCount = await this.blacklistService.cleanupExpiredEntries();

      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired blacklist entries`,
        cleanedCount
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error cleaning up expired entries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired entries'
      });
    }
  };

  /**
   * Check user blacklist status (for user profile)
   */
  checkUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as User)?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const blacklistResult = await this.blacklistService.checkUserBlacklist(user);

      res.json({
        success: true,
        data: {
          isBlacklisted: blacklistResult.isBlacklisted,
          reason: blacklistResult.reason,
          description: blacklistResult.description
        }
      });
    } catch (error: any) {
      console.error('[BLACKLIST] Error checking user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check user blacklist status'
      });
    }
  };
}
