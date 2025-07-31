import AppDataSource from "../ormconfig";
import { Repository } from "typeorm";
import { Blacklist, BlacklistType, BlacklistReason, BlacklistStatus } from "../entity/Blacklist";
import { User } from "../entity/User";

export interface BlacklistCheckResult {
  isBlacklisted: boolean;
  reason?: BlacklistReason;
  description?: string;
  blacklistEntry?: Blacklist;
}

export interface CreateBlacklistEntry {
  type: BlacklistType;
  identifier: string;
  reason: BlacklistReason;
  description?: string;
  referenceNumber?: string;
  source?: string;
  addedByUserId?: number;
  expiryDate?: Date;
}

export class BlacklistService {
  private blacklistRepository: Repository<Blacklist>;
  private userRepository: Repository<User>;

  constructor() {
    this.blacklistRepository = AppDataSource.getRepository(Blacklist);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Check if a user is blacklisted by any identifier
   */
  async checkUserBlacklist(user: User): Promise<BlacklistCheckResult> {
    const identifiers = [
      { type: BlacklistType.EMAIL, value: user.email },
      { type: BlacklistType.WALLET_ADDRESS, value: user.wallet_address },
      { type: BlacklistType.USER, value: user.id.toString() }
    ].filter(item => item.value !== null && item.value !== undefined && item.value !== ''); // Remove null/undefined/empty values

    for (const identifier of identifiers) {
      const result = await this.checkBlacklist(identifier.type, identifier.value);
      if (result.isBlacklisted) {
        return result;
      }
    }

    return { isBlacklisted: false };
  }

  /**
   * Check if a specific identifier is blacklisted
   */
  async checkBlacklist(type: BlacklistType, identifier: string): Promise<BlacklistCheckResult> {
    const blacklistEntry = await this.blacklistRepository.findOne({
      where: {
        type,
        identifier: identifier.toLowerCase(),
        status: BlacklistStatus.ACTIVE
      },
      relations: ['addedBy', 'reviewedBy']
    });

    if (!blacklistEntry) {
      return { isBlacklisted: false };
    }

    // Check if expired
    if (blacklistEntry.isExpired()) {
      // Automatically mark as inactive if expired
      await this.deactivateBlacklistEntry(blacklistEntry.id);
      return { isBlacklisted: false };
    }

    return {
      isBlacklisted: true,
      reason: blacklistEntry.reason,
      description: blacklistEntry.description,
      blacklistEntry
    };
  }

  /**
   * Add new blacklist entry
   */
  async addToBlacklist(entry: CreateBlacklistEntry): Promise<Blacklist> {
    // Check if already exists
    const existing = await this.blacklistRepository.findOne({
      where: {
        type: entry.type,
        identifier: entry.identifier.toLowerCase()
      }
    });

    if (existing && existing.status === BlacklistStatus.ACTIVE) {
      throw new Error(`${entry.type} ${entry.identifier} is already blacklisted`);
    }

    const blacklistEntry = this.blacklistRepository.create({
      type: entry.type,
      identifier: entry.identifier.toLowerCase(),
      reason: entry.reason,
      description: entry.description,
      reference_number: entry.referenceNumber,
      source: entry.source,
      added_by_user_id: entry.addedByUserId,
      expiry_date: entry.expiryDate,
      status: BlacklistStatus.ACTIVE
    });

    const saved = await this.blacklistRepository.save(blacklistEntry);

    // Log the action
    console.log(`[BLACKLIST] Added ${entry.type}: ${entry.identifier} - Reason: ${entry.reason}`);

    return saved;
  }

  /**
   * Remove from blacklist (deactivate)
   */
  async removeFromBlacklist(id: number, reviewedByUserId?: number, reviewNotes?: string): Promise<void> {
    const blacklistEntry = await this.blacklistRepository.findOne({
      where: { id }
    });

    if (!blacklistEntry) {
      throw new Error('Blacklist entry not found');
    }

    await this.blacklistRepository.update(id, {
      status: BlacklistStatus.INACTIVE,
      reviewed_by_user_id: reviewedByUserId,
      review_date: new Date(),
      review_notes: reviewNotes
    });

    console.log(`[BLACKLIST] Removed ${blacklistEntry.type}: ${blacklistEntry.identifier}`);
  }

  /**
   * Deactivate expired blacklist entry
   */
  private async deactivateBlacklistEntry(id: number): Promise<void> {
    await this.blacklistRepository.update(id, {
      status: BlacklistStatus.INACTIVE,
      review_date: new Date(),
      review_notes: 'Automatically deactivated - expired'
    });
  }

  /**
   * Get all active blacklist entries
   */
  async getActiveBlacklist(): Promise<Blacklist[]> {
    return await this.blacklistRepository.find({
      where: { status: BlacklistStatus.ACTIVE },
      relations: ['addedBy', 'reviewedBy'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Get blacklist entries by type
   */
  async getBlacklistByType(type: BlacklistType): Promise<Blacklist[]> {
    return await this.blacklistRepository.find({
      where: { type, status: BlacklistStatus.ACTIVE },
      relations: ['addedBy', 'reviewedBy'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Search blacklist entries
   */
  async searchBlacklist(query: string): Promise<Blacklist[]> {
    return await this.blacklistRepository
      .createQueryBuilder('blacklist')
      .where('blacklist.identifier LIKE :query', { query: `%${query.toLowerCase()}%` })
      .orWhere('blacklist.description LIKE :query', { query: `%${query}%` })
      .orWhere('blacklist.reference_number LIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('blacklist.addedBy', 'addedBy')
      .leftJoinAndSelect('blacklist.reviewedBy', 'reviewedBy')
      .orderBy('blacklist.created_at', 'DESC')
      .getMany();
  }

  /**
   * Bulk check multiple identifiers
   */
  async bulkCheckBlacklist(identifiers: { type: BlacklistType; value: string }[]): Promise<Map<string, BlacklistCheckResult>> {
    const results = new Map<string, BlacklistCheckResult>();

    for (const identifier of identifiers) {
      const key = `${identifier.type}:${identifier.value}`;
      const result = await this.checkBlacklist(identifier.type, identifier.value);
      results.set(key, result);
    }

    return results;
  }

  /**
   * Get blacklist statistics
   */
  async getBlacklistStats(): Promise<{
    total: number;
    byType: Record<BlacklistType, number>;
    byReason: Record<BlacklistReason, number>;
    byStatus: Record<BlacklistStatus, number>;
  }> {
    const [total, byType, byReason, byStatus] = await Promise.all([
      this.blacklistRepository.count(),
      this.blacklistRepository
        .createQueryBuilder('blacklist')
        .select('blacklist.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('blacklist.type')
        .getRawMany(),
      this.blacklistRepository
        .createQueryBuilder('blacklist')
        .select('blacklist.reason', 'reason')
        .addSelect('COUNT(*)', 'count')
        .groupBy('blacklist.reason')
        .getRawMany(),
      this.blacklistRepository
        .createQueryBuilder('blacklist')
        .select('blacklist.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('blacklist.status')
        .getRawMany()
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: parseInt(item.count) }), {} as Record<BlacklistType, number>),
      byReason: byReason.reduce((acc, item) => ({ ...acc, [item.reason]: parseInt(item.count) }), {} as Record<BlacklistReason, number>),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }), {} as Record<BlacklistStatus, number>)
    };
  }

  /**
   * Clean up expired blacklist entries
   */
  async cleanupExpiredEntries(): Promise<number> {
    const expiredEntries = await this.blacklistRepository
      .createQueryBuilder('blacklist')
      .where('blacklist.expiry_date < :now', { now: new Date() })
      .andWhere('blacklist.status = :status', { status: BlacklistStatus.ACTIVE })
      .getMany();

    for (const entry of expiredEntries) {
      await this.deactivateBlacklistEntry(entry.id);
    }

    console.log(`[BLACKLIST] Cleaned up ${expiredEntries.length} expired entries`);
    return expiredEntries.length;
  }
}
