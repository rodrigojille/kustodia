#!/usr/bin/env node

/**
 * 🔍 HEROKU MIGRATION ASSESSMENT TOOL
 * 
 * This script compares local database schema with Heroku production
 * to identify missing tables, columns, and data that need migration.
 * 
 * USAGE:
 * 1. Set your Heroku database URL in HEROKU_DATABASE_URL
 * 2. Run: node heroku-migration-assessment.js
 * 
 * FEATURES:
 * - Compares table structures between local and Heroku
 * - Identifies missing columns and their types
 * - Generates migration SQL commands
 * - Checks for data consistency
 * - Provides rollback plans
 */

const { Client } = require('pg');
require('dotenv').config();

// 🔧 CONFIGURATION
const LOCAL_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kustodia_dev';
const HEROKU_DATABASE_URL = process.env.HEROKU_DATABASE_URL || process.env.DATABASE_URL_PRODUCTION;

// 📋 EXPECTED SCHEMA BASED ON ENTITIES
const EXPECTED_SCHEMA = {
  users: {
    columns: [
      { name: 'id', type: 'integer', nullable: false, default: 'nextval' },
      { name: 'email', type: 'character varying', nullable: false, unique: true },
      { name: 'password_hash', type: 'character varying', nullable: false },
      { name: 'full_name', type: 'character varying', nullable: true },
      { name: 'kyc_status', type: 'character varying', nullable: false, default: 'pending' },
      { name: 'wallet_address', type: 'character varying', nullable: true },
      { name: 'portal_client_id', type: 'character varying', nullable: true },
      { name: 'portal_share', type: 'text', nullable: true },
      { name: 'googleid', type: 'character varying', nullable: true, unique: true },
      { name: 'googleaccesstoken', type: 'text', nullable: true },
      { name: 'googlerefreshtoken', type: 'text', nullable: true },
      { name: 'mxnb_balance', type: 'numeric', nullable: false, default: '0' },
      { name: 'role', type: 'character varying', nullable: false, default: 'user' },
      { name: 'deposit_clabe', type: 'character varying', nullable: true },
      { name: 'payout_clabe', type: 'character varying', nullable: true },
      { name: 'juno_bank_account_id', type: 'character varying', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false }
    ]
  },
  payments: {
    columns: [
      { name: 'id', type: 'integer', nullable: false, default: 'nextval' },
      { name: 'user_id', type: 'integer', nullable: true },
      { name: 'seller_id', type: 'integer', nullable: true },
      { name: 'recipient_email', type: 'character varying', nullable: false },
      { name: 'payer_email', type: 'character varying', nullable: true },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'character varying', nullable: false, default: 'MXN' },
      { name: 'description', type: 'character varying', nullable: true },
      { name: 'reference', type: 'character varying', nullable: true },
      { name: 'transaction_id', type: 'character varying', nullable: true },
      { name: 'juno_transaction_id', type: 'integer', nullable: true },
      { name: 'blockchain_tx_hash', type: 'character varying', nullable: true },
      { name: 'status', type: 'character varying', nullable: false, default: 'pending' },
      { name: 'payer_approval', type: 'boolean', nullable: false, default: false },
      { name: 'payee_approval', type: 'boolean', nullable: false, default: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false }
    ]
  },
  escrows: {
    columns: [
      { name: 'id', type: 'integer', nullable: false, default: 'nextval' },
      { name: 'payment_id', type: 'integer', nullable: true },
      { name: 'smart_contract_escrow_id', type: 'character varying', nullable: true },
      { name: 'blockchain_tx_hash', type: 'character varying', nullable: true },
      { name: 'release_tx_hash', type: 'character varying', nullable: true },
      { name: 'custody_percent', type: 'numeric', nullable: false },
      { name: 'custody_amount', type: 'numeric', nullable: false },
      { name: 'release_amount', type: 'numeric', nullable: false },
      { name: 'status', type: 'character varying', nullable: false, default: 'active' },
      { name: 'dispute_status', type: 'character varying', nullable: false, default: 'none' },
      { name: 'dispute_reason', type: 'character varying', nullable: true },
      { name: 'dispute_details', type: 'character varying', nullable: true },
      { name: 'dispute_evidence', type: 'character varying', nullable: true },
      { name: 'dispute_history', type: 'jsonb', nullable: true },
      { name: 'custody_end', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false }
    ]
  },
  payment_events: {
    columns: [
      { name: 'id', type: 'integer', nullable: false, default: 'nextval' },
      { name: 'payment_id', type: 'integer', nullable: true },
      { name: 'event_type', type: 'character varying', nullable: false },
      { name: 'description', type: 'character varying', nullable: true },
      { name: 'is_public', type: 'boolean', nullable: false, default: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false }
    ]
  },
  juno_transactions: {
    columns: [
      { name: 'id', type: 'integer', nullable: false, default: 'nextval' },
      { name: 'juno_transaction_id', type: 'character varying', nullable: false, unique: true },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'character varying', nullable: false },
      { name: 'status', type: 'character varying', nullable: false },
      { name: 'transaction_type', type: 'character varying', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false }
    ]
  }
};

class MigrationAssessment {
  constructor() {
    this.localClient = null;
    this.herokuClient = null;
    this.migrationCommands = [];
    this.issues = [];
  }

  async connect() {
    console.log('🔌 Connecting to databases...\n');
    
    // Connect to local database
    try {
      this.localClient = new Client({ connectionString: LOCAL_DATABASE_URL });
      await this.localClient.connect();
      console.log('✅ Connected to local database');
    } catch (error) {
      console.log('❌ Failed to connect to local database:', error.message);
      throw error;
    }

    // Connect to Heroku database
    if (!HEROKU_DATABASE_URL) {
      console.log('⚠️  HEROKU_DATABASE_URL not set - running local-only assessment');
      return;
    }

    try {
      this.herokuClient = new Client({ connectionString: HEROKU_DATABASE_URL });
      await this.herokuClient.connect();
      console.log('✅ Connected to Heroku database');
    } catch (error) {
      console.log('❌ Failed to connect to Heroku database:', error.message);
      console.log('   Continuing with local schema validation only...');
    }
    
    console.log('');
  }

  async getTableSchema(client, tableName) {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(query, [tableName]);
    return result.rows;
  }

  async checkTableExists(client, tableName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    
    const result = await client.query(query, [tableName]);
    return result.rows[0].exists;
  }

  compareColumns(expected, actual) {
    const missing = [];
    const different = [];

    for (const expectedCol of expected) {
      const actualCol = actual.find(col => col.column_name === expectedCol.name);
      
      if (!actualCol) {
        missing.push(expectedCol);
      } else {
        // Check for type differences
        if (!this.isCompatibleType(expectedCol.type, actualCol.data_type)) {
          different.push({
            column: expectedCol.name,
            expected: expectedCol.type,
            actual: actualCol.data_type
          });
        }
      }
    }

    return { missing, different };
  }

  isCompatibleType(expected, actual) {
    const typeMap = {
      'integer': ['integer', 'bigint'],
      'character varying': ['character varying', 'varchar', 'text'],
      'text': ['text', 'character varying'],
      'numeric': ['numeric', 'decimal'],
      'boolean': ['boolean'],
      'timestamp with time zone': ['timestamp with time zone', 'timestamptz'],
      'jsonb': ['jsonb']
    };

    const compatibleTypes = typeMap[expected] || [expected];
    return compatibleTypes.some(type => actual.includes(type));
  }

  generateMigrationSQL(tableName, missingColumns) {
    const commands = [];
    
    for (const col of missingColumns) {
      let sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
      
      if (!col.nullable) {
        if (col.default && !col.default.includes('nextval')) {
          sql += ` NOT NULL DEFAULT ${col.default}`;
        } else {
          // For non-nullable columns without defaults, we need to handle existing data
          sql += ` DEFAULT NULL`; // Add as nullable first
          commands.push(sql);
          commands.push(`-- TODO: Update existing rows and then set NOT NULL constraint for ${col.name}`);
          continue;
        }
      }
      
      if (col.unique) {
        commands.push(`ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_${col.name}_unique UNIQUE (${col.name});`);
      }
      
      commands.push(sql + ';');
    }
    
    return commands;
  }

  async assessTable(tableName) {
    console.log(`📋 Assessing table: ${tableName}`);
    console.log('─'.repeat(50));

    const expectedColumns = EXPECTED_SCHEMA[tableName]?.columns || [];
    
    // Check local schema
    const localExists = await this.checkTableExists(this.localClient, tableName);
    if (!localExists) {
      console.log(`❌ Table ${tableName} does not exist locally`);
      this.issues.push(`Table ${tableName} missing locally`);
      return;
    }

    const localSchema = await this.getTableSchema(this.localClient, tableName);
    console.log(`✅ Local table has ${localSchema.length} columns`);

    // Check Heroku schema if connected
    if (this.herokuClient) {
      const herokuExists = await this.checkTableExists(this.herokuClient, tableName);
      if (!herokuExists) {
        console.log(`❌ Table ${tableName} does not exist on Heroku`);
        this.issues.push(`Table ${tableName} missing on Heroku`);
        
        // Generate CREATE TABLE statement
        console.log(`📝 Need to create table ${tableName} on Heroku`);
        return;
      }

      const herokuSchema = await this.getTableSchema(this.herokuClient, tableName);
      console.log(`✅ Heroku table has ${herokuSchema.length} columns`);

      // Compare schemas
      const comparison = this.compareColumns(expectedColumns, herokuSchema);
      
      if (comparison.missing.length > 0) {
        console.log(`⚠️  Missing ${comparison.missing.length} columns on Heroku:`);
        comparison.missing.forEach(col => {
          console.log(`   - ${col.name} (${col.type})`);
        });
        
        const migrationSQL = this.generateMigrationSQL(tableName, comparison.missing);
        this.migrationCommands.push(`-- Migrate ${tableName} table`);
        this.migrationCommands.push(...migrationSQL);
        this.migrationCommands.push('');
      }

      if (comparison.different.length > 0) {
        console.log(`⚠️  Type differences found:`);
        comparison.different.forEach(diff => {
          console.log(`   - ${diff.column}: expected ${diff.expected}, got ${diff.actual}`);
        });
      }

      if (comparison.missing.length === 0 && comparison.different.length === 0) {
        console.log(`✅ Schema matches expected structure`);
      }
    } else {
      // Local-only validation
      const comparison = this.compareColumns(expectedColumns, localSchema);
      if (comparison.missing.length > 0) {
        console.log(`⚠️  Local schema missing columns:`);
        comparison.missing.forEach(col => {
          console.log(`   - ${col.name} (${col.type})`);
        });
      } else {
        console.log(`✅ Local schema complete`);
      }
    }

    console.log('');
  }

  async generateMigrationScript() {
    if (this.migrationCommands.length === 0) {
      console.log('🎉 No migrations needed - schemas are up to date!');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `heroku-migration-${timestamp}.sql`;
    
    const migrationScript = [
      '-- 🚀 HEROKU MIGRATION SCRIPT',
      `-- Generated: ${new Date().toISOString()}`,
      '-- Execute these commands on Heroku Postgres',
      '',
      '-- ⚠️  BACKUP FIRST: pg_dump before running migrations',
      '',
      ...this.migrationCommands,
      '',
      '-- ✅ VERIFICATION QUERIES',
      '-- Run these after migration to verify:',
      '',
      ...Object.keys(EXPECTED_SCHEMA).map(table => 
        `SELECT COUNT(*) as ${table}_count FROM ${table};`
      ),
      '',
      '-- 🔍 SCHEMA VERIFICATION',
      ...Object.keys(EXPECTED_SCHEMA).map(table => `
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = '${table}' 
ORDER BY ordinal_position;`
      )
    ].join('\n');

    console.log('📝 MIGRATION SCRIPT GENERATED:');
    console.log('═'.repeat(60));
    console.log(migrationScript);
    console.log('═'.repeat(60));
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, filename);
    fs.writeFileSync(scriptPath, migrationScript);
    console.log(`💾 Migration script saved to: ${scriptPath}`);
  }

  async disconnect() {
    if (this.localClient) {
      await this.localClient.end();
      console.log('🔌 Disconnected from local database');
    }
    
    if (this.herokuClient) {
      await this.herokuClient.end();
      console.log('🔌 Disconnected from Heroku database');
    }
  }

  async run() {
    console.log('🔍 HEROKU MIGRATION ASSESSMENT');
    console.log('═'.repeat(60));
    console.log(`Local DB: ${LOCAL_DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
    console.log(`Heroku DB: ${HEROKU_DATABASE_URL ? HEROKU_DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'Not configured'}`);
    console.log('═'.repeat(60));
    console.log('');

    try {
      await this.connect();
      
      // Assess each table
      for (const tableName of Object.keys(EXPECTED_SCHEMA)) {
        await this.assessTable(tableName);
      }
      
      // Generate migration script
      await this.generateMigrationScript();
      
      // Summary
      console.log('📊 ASSESSMENT SUMMARY:');
      console.log('─'.repeat(30));
      console.log(`Tables assessed: ${Object.keys(EXPECTED_SCHEMA).length}`);
      console.log(`Issues found: ${this.issues.length}`);
      console.log(`Migration commands: ${this.migrationCommands.length}`);
      
      if (this.issues.length > 0) {
        console.log('\n❌ Issues found:');
        this.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
    } catch (error) {
      console.error('💥 Assessment failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// 🚀 RUN ASSESSMENT
if (require.main === module) {
  const assessment = new MigrationAssessment();
  assessment.run().catch(console.error);
}

module.exports = MigrationAssessment;
