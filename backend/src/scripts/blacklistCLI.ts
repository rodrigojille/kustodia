#!/usr/bin/env node

import AppDataSource from "../ormconfig";
import { BlacklistService } from "../services/BlacklistService";
import { BlacklistType, BlacklistReason } from "../entity/Blacklist";
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BlacklistCLI {
  private blacklistService: BlacklistService;

  constructor() {
    this.blacklistService = new BlacklistService();
  }

  async initialize(): Promise<void> {
    try {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async showMenu(): Promise<void> {
    console.log('\n🔒 KUSTODIA BLACKLIST MANAGEMENT CLI');
    console.log('=====================================');
    console.log('1. Add to blacklist');
    console.log('2. Remove from blacklist');
    console.log('3. Check blacklist status');
    console.log('4. List active blacklist entries');
    console.log('5. Search blacklist');
    console.log('6. Show statistics');
    console.log('7. Cleanup expired entries');
    console.log('8. Bulk import from file');
    console.log('9. Export blacklist');
    console.log('0. Exit');
    console.log('=====================================');
  }

  private question(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
  }

  private async selectType(): Promise<BlacklistType> {
    console.log('\nSelect blacklist type:');
    console.log('1. User ID');
    console.log('2. Wallet Address');
    console.log('3. Email');
    console.log('4. IP Address');
    
    const choice = await this.question('Enter choice (1-4): ');
    
    switch (choice) {
      case '1': return BlacklistType.USER;
      case '2': return BlacklistType.WALLET_ADDRESS;
      case '3': return BlacklistType.EMAIL;
      case '4': return BlacklistType.IP_ADDRESS;
      default:
        console.log('Invalid choice, defaulting to User ID');
        return BlacklistType.USER;
    }
  }

  private async selectReason(): Promise<BlacklistReason> {
    console.log('\nSelect blacklist reason:');
    console.log('1. Money Laundering');
    console.log('2. Fraud');
    console.log('3. Suspicious Activity');
    console.log('4. Regulatory Request');
    console.log('5. Sanctions');
    console.log('6. High Risk Jurisdiction');
    console.log('7. Manual Review');
    console.log('8. Other');
    
    const choice = await this.question('Enter choice (1-8): ');
    
    switch (choice) {
      case '1': return BlacklistReason.MONEY_LAUNDERING;
      case '2': return BlacklistReason.FRAUD;
      case '3': return BlacklistReason.SUSPICIOUS_ACTIVITY;
      case '4': return BlacklistReason.REGULATORY_REQUEST;
      case '5': return BlacklistReason.SANCTIONS;
      case '6': return BlacklistReason.HIGH_RISK_JURISDICTION;
      case '7': return BlacklistReason.MANUAL_REVIEW;
      case '8': return BlacklistReason.OTHER;
      default:
        console.log('Invalid choice, defaulting to Manual Review');
        return BlacklistReason.MANUAL_REVIEW;
    }
  }

  async addToBlacklist(): Promise<void> {
    try {
      console.log('\n📝 ADD TO BLACKLIST');
      console.log('===================');
      
      const type = await this.selectType();
      const identifier = await this.question('Enter identifier: ');
      const reason = await this.selectReason();
      const description = await this.question('Enter description (optional): ');
      const referenceNumber = await this.question('Enter reference number (optional): ');
      const source = await this.question('Enter source (optional): ');
      
      const expiryInput = await this.question('Enter expiry date (YYYY-MM-DD, optional): ');
      const expiryDate = expiryInput ? new Date(expiryInput) : undefined;

      const entry = await this.blacklistService.addToBlacklist({
        type,
        identifier,
        reason,
        description: description || undefined,
        referenceNumber: referenceNumber || undefined,
        source: source || undefined,
        expiryDate
      });

      console.log('✅ Successfully added to blacklist:');
      console.log(`   ID: ${entry.id}`);
      console.log(`   Type: ${entry.type}`);
      console.log(`   Identifier: ${entry.identifier}`);
      console.log(`   Reason: ${entry.reason}`);
      
    } catch (error: any) {
      console.error('❌ Error adding to blacklist:', error.message);
    }
  }

  async removeFromBlacklist(): Promise<void> {
    try {
      console.log('\n🗑️  REMOVE FROM BLACKLIST');
      console.log('========================');
      
      const idInput = await this.question('Enter blacklist entry ID: ');
      const id = parseInt(idInput);
      
      if (isNaN(id)) {
        console.log('❌ Invalid ID');
        return;
      }

      const reviewNotes = await this.question('Enter review notes (optional): ');

      await this.blacklistService.removeFromBlacklist(id, undefined, reviewNotes || undefined);
      
      console.log('✅ Successfully removed from blacklist');
      
    } catch (error: any) {
      console.error('❌ Error removing from blacklist:', error.message);
    }
  }

  async checkBlacklist(): Promise<void> {
    try {
      console.log('\n🔍 CHECK BLACKLIST STATUS');
      console.log('========================');
      
      const type = await this.selectType();
      const identifier = await this.question('Enter identifier: ');

      const result = await this.blacklistService.checkBlacklist(type, identifier);
      
      if (result.isBlacklisted) {
        console.log('🚨 BLACKLISTED');
        console.log(`   Reason: ${result.reason}`);
        console.log(`   Description: ${result.description || 'N/A'}`);
        if (result.blacklistEntry) {
          console.log(`   Added: ${result.blacklistEntry.created_at}`);
          console.log(`   Source: ${result.blacklistEntry.source || 'N/A'}`);
        }
      } else {
        console.log('✅ NOT BLACKLISTED');
      }
      
    } catch (error: any) {
      console.error('❌ Error checking blacklist:', error.message);
    }
  }

  async listActiveEntries(): Promise<void> {
    try {
      console.log('\n📋 ACTIVE BLACKLIST ENTRIES');
      console.log('===========================');
      
      const entries = await this.blacklistService.getActiveBlacklist();
      
      if (entries.length === 0) {
        console.log('No active blacklist entries found');
        return;
      }

      console.log(`Found ${entries.length} active entries:\n`);
      
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ID: ${entry.id}`);
        console.log(`   Type: ${entry.type}`);
        console.log(`   Identifier: ${entry.identifier}`);
        console.log(`   Reason: ${entry.reason}`);
        console.log(`   Created: ${entry.created_at}`);
        console.log(`   Source: ${entry.source || 'N/A'}`);
        if (entry.expiry_date) {
          console.log(`   Expires: ${entry.expiry_date}`);
        }
        console.log('');
      });
      
    } catch (error: any) {
      console.error('❌ Error listing entries:', error.message);
    }
  }

  async searchBlacklist(): Promise<void> {
    try {
      console.log('\n🔎 SEARCH BLACKLIST');
      console.log('==================');
      
      const query = await this.question('Enter search query: ');
      const entries = await this.blacklistService.searchBlacklist(query);
      
      if (entries.length === 0) {
        console.log('No entries found matching your search');
        return;
      }

      console.log(`Found ${entries.length} matching entries:\n`);
      
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ID: ${entry.id} | ${entry.type}: ${entry.identifier}`);
        console.log(`   Reason: ${entry.reason} | Status: ${entry.status}`);
        if (entry.description) {
          console.log(`   Description: ${entry.description}`);
        }
        console.log('');
      });
      
    } catch (error: any) {
      console.error('❌ Error searching blacklist:', error.message);
    }
  }

  async showStatistics(): Promise<void> {
    try {
      console.log('\n📊 BLACKLIST STATISTICS');
      console.log('=======================');
      
      const stats = await this.blacklistService.getBlacklistStats();
      
      console.log(`Total entries: ${stats.total}\n`);
      
      console.log('By Type:');
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      
      console.log('\nBy Reason:');
      Object.entries(stats.byReason).forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count}`);
      });
      
      console.log('\nBy Status:');
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
    } catch (error: any) {
      console.error('❌ Error getting statistics:', error.message);
    }
  }

  async cleanupExpired(): Promise<void> {
    try {
      console.log('\n🧹 CLEANUP EXPIRED ENTRIES');
      console.log('==========================');
      
      const count = await this.blacklistService.cleanupExpiredEntries();
      console.log(`✅ Cleaned up ${count} expired entries`);
      
    } catch (error: any) {
      console.error('❌ Error cleaning up expired entries:', error.message);
    }
  }

  async run(): Promise<void> {
    await this.initialize();
    
    while (true) {
      await this.showMenu();
      const choice = await this.question('\nEnter your choice: ');
      
      switch (choice) {
        case '1':
          await this.addToBlacklist();
          break;
        case '2':
          await this.removeFromBlacklist();
          break;
        case '3':
          await this.checkBlacklist();
          break;
        case '4':
          await this.listActiveEntries();
          break;
        case '5':
          await this.searchBlacklist();
          break;
        case '6':
          await this.showStatistics();
          break;
        case '7':
          await this.cleanupExpired();
          break;
        case '8':
          console.log('📁 Bulk import feature coming soon...');
          break;
        case '9':
          console.log('📤 Export feature coming soon...');
          break;
        case '0':
          console.log('👋 Goodbye!');
          rl.close();
          await AppDataSource.destroy();
          process.exit(0);
        default:
          console.log('❌ Invalid choice, please try again');
      }
      
      await this.question('\nPress Enter to continue...');
    }
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new BlacklistCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

export { BlacklistCLI };
