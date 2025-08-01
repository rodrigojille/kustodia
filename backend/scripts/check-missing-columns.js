#!/usr/bin/env node

/**
 * 🔍 COLUMN COMPARISON TOOL
 * 
 * This script compares columns between local and production databases
 * to identify missing columns that need to be added to existing tables.
 * 
 * USAGE:
 * 1. Set your Heroku database URL in HEROKU_DATABASE_URL
 * 2. Run: node check-missing-columns.js
 */

const { Client } = require('pg');
require('dotenv').config();

// 🔧 CONFIGURATION
const LOCAL_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kustodia_dev';
const HEROKU_DATABASE_URL = process.env.DATABASE_URL_PRODUCTION || process.env.HEROKU_DATABASE_URL;

// 📋 EXPECTED COLUMNS BASED ON ENTITY DEFINITIONS (using singular table names)
const EXPECTED_COLUMNS = {
  user: [
    'id', 'email', 'password_hash', 'full_name', 'kyc_status', 'wallet_address',
    'portal_client_id', 'portal_share', 'mxnb_balance', 'role', 'deposit_clabe', 
    'payout_clabe', 'juno_bank_account_id', 'email_verified', 'email_verification_token',
    'password_reset_token', 'truora_process_id', 'password_reset_expires',
    'created_at', 'updated_at'
    // Note: googleid, googleaccesstoken, googlerefreshtoken exist in production with different casing
  ],
  payment: [
    'id', 'user_id', 'seller_id', 'recipient_email', 'payer_email', 'amount',
    'currency', 'description', 'reference', 'juno_transaction_id',
    'blockchain_tx_hash', 'bitso_tracking_number', 'travel_rule_data',
    'deposit_clabe', 'payout_clabe', 'payout_juno_bank_account_id',
    'juno_payment_id', 'commission_percent', 'commission_amount',
    'platform_commission_percent', 'platform_commission_amount',
    'platform_commission_beneficiary_email', 'commission_beneficiary_name',
    'commission_beneficiary_email', 'commission_beneficiary_clabe',
    'commission_beneficiary_juno_bank_account_id', 'payer_clabe',
    'status', 'payment_type', 'payer_approval', 'payee_approval',
    'payer_approval_timestamp', 'payee_approval_timestamp', 'release_conditions',
    'vertical_type', 'operation_type', 'initiator_type', 'transaction_subtype',
    'vehicle_brand', 'vehicle_model', 'vehicle_year', 'vehicle_vin',
    'vehicle_mileage', 'vehicle_condition', 'electronics_brand', 'electronics_model',
    'electronics_condition', 'electronics_warranty', 'electronics_serial',
    'appliance_type', 'appliance_brand', 'appliance_years_use', 'appliance_efficiency',
    'appliance_condition', 'appliance_serial', 'furniture_type', 'furniture_material',
    'furniture_dimensions', 'furniture_condition', 'multisig_required', 'multisig_status',
    'multisig_approval_id', 'created_at', 'updated_at'
  ],
  escrow: [
    'id', 'payment_id', 'smart_contract_escrow_id', 'blockchain_tx_hash',
    'release_tx_hash', 'custody_percent', 'custody_amount', 'release_amount',
    'status', 'dispute_status', 'dispute_reason', 'dispute_details',
    'dispute_evidence', 'dispute_history', 'custody_end', 'created_at', 'updated_at'
  ],
  payment_event: [
    'id', 'payment_id', 'event_type', 'description', 'is_public', 'created_at'
  ],
  juno_transaction: [
    'id', 'juno_transaction_id', 'amount', 'currency', 'status', 
    'transaction_type', 'created_at', 'updated_at'
  ],
  dispute: [
    'id', 'payment_id', 'raised_by', 'reason', 'details', 'evidence',
    'status', 'created_at', 'updated_at'
  ],
  notification: [
    'id', 'user_id', 'message', 'link', 'type', 'category', 'read', 'payment_id', 'createdAt'
  ],
  wallet_transaction: [
    'id', 'user_id', 'transaction_hash', 'amount', 'currency', 'type',
    'status', 'block_number', 'gas_used', 'gas_price', 'created_at', 'updated_at'
  ]
};

class ColumnChecker {
  constructor() {
    this.localClient = null;
    this.herokuClient = null;
    this.missingColumns = {};
    this.migrationCommands = [];
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
      console.log('⚠️  HEROKU_DATABASE_URL not set - running local-only check');
      return;
    }

    try {
      // Configure SSL for production database
      const herokuConfig = {
        connectionString: HEROKU_DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Required for most cloud databases
        }
      };
      
      this.herokuClient = new Client(herokuConfig);
      await this.herokuClient.connect();
      console.log('✅ Connected to Heroku database');
    } catch (error) {
      console.log('❌ Failed to connect to Heroku database:', error.message);
      console.log('   Continuing with local schema analysis only...');
    }
    
    console.log('');
  }

  async getTableColumns(client, tableName) {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
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

  generateColumnMigrationSQL(tableName, columnName, columnInfo) {
    const typeMap = {
      'integer': 'INTEGER',
      'bigint': 'BIGINT',
      'character varying': 'VARCHAR(255)',
      'text': 'TEXT',
      'numeric': 'DECIMAL(18,6)',
      'boolean': 'BOOLEAN',
      'timestamp with time zone': 'TIMESTAMP WITH TIME ZONE',
      'jsonb': 'JSONB',
      'date': 'DATE'
    };

    let dataType = typeMap[columnInfo.data_type] || columnInfo.data_type.toUpperCase();
    
    // Handle specific length for varchar
    if (columnInfo.data_type === 'character varying' && columnInfo.character_maximum_length) {
      dataType = `VARCHAR(${columnInfo.character_maximum_length})`;
    }
    
    // Handle numeric precision
    if (columnInfo.data_type === 'numeric' && columnInfo.numeric_precision) {
      dataType = `DECIMAL(${columnInfo.numeric_precision},${columnInfo.numeric_scale || 0})`;
    }

    let sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${dataType}`;
    
    // Add default value if exists
    if (columnInfo.column_default) {
      if (columnInfo.column_default.includes('nextval')) {
        // Skip auto-increment columns
        return null;
      } else if (columnInfo.data_type === 'boolean') {
        sql += ` DEFAULT ${columnInfo.column_default}`;
      } else if (columnInfo.data_type === 'character varying' || columnInfo.data_type === 'text') {
        sql += ` DEFAULT '${columnInfo.column_default.replace(/'/g, "''")}'`;
      } else {
        sql += ` DEFAULT ${columnInfo.column_default}`;
      }
    }
    
    // Add NOT NULL constraint if needed
    if (columnInfo.is_nullable === 'NO' && !columnInfo.column_default) {
      // For non-nullable columns without defaults, add as nullable first
      sql += ' -- TODO: Set NOT NULL after updating existing rows';
    } else if (columnInfo.is_nullable === 'NO') {
      sql += ' NOT NULL';
    }
    
    return sql + ';';
  }

  async checkTable(tableName) {
    console.log(`📋 Checking table: ${tableName}`);
    console.log('─'.repeat(50));

    // Check if table exists in both databases
    const localExists = await this.checkTableExists(this.localClient, tableName);
    if (!localExists) {
      console.log(`❌ Table ${tableName} does not exist locally`);
      return;
    }

    if (!this.herokuClient) {
      console.log(`⚠️  Cannot compare with Heroku - no connection`);
      return;
    }

    const herokuExists = await this.checkTableExists(this.herokuClient, tableName);
    if (!herokuExists) {
      console.log(`❌ Table ${tableName} does not exist on Heroku`);
      return;
    }

    // Get columns from both databases
    const localColumns = await this.getTableColumns(this.localClient, tableName);
    const herokuColumns = await this.getTableColumns(this.herokuClient, tableName);

    console.log(`📊 Local: ${localColumns.length} columns, Heroku: ${herokuColumns.length} columns`);

    // Find missing columns in Heroku
    const herokuColumnNames = herokuColumns.map(col => col.column_name);
    const missingInHeroku = localColumns.filter(col => !herokuColumnNames.includes(col.column_name));

    // Find extra columns in Heroku (not in local)
    const localColumnNames = localColumns.map(col => col.column_name);
    const extraInHeroku = herokuColumns.filter(col => !localColumnNames.includes(col.column_name));

    if (missingInHeroku.length > 0) {
      console.log(`🔴 Missing ${missingInHeroku.length} columns in Heroku:`);
      this.missingColumns[tableName] = missingInHeroku;
      
      missingInHeroku.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
        const migrationSQL = this.generateColumnMigrationSQL(tableName, col.column_name, col);
        if (migrationSQL) {
          this.migrationCommands.push(migrationSQL);
        }
      });
    }

    if (extraInHeroku.length > 0) {
      console.log(`🟡 Extra columns in Heroku (not in local):`);
      extraInHeroku.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    if (missingInHeroku.length === 0 && extraInHeroku.length === 0) {
      console.log(`✅ Columns match between local and Heroku`);
    }

    console.log('');
  }

  async generateMigrationScript() {
    if (this.migrationCommands.length === 0) {
      console.log('🎉 No column migrations needed - all tables are up to date!');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `column-migration-${timestamp}.sql`;
    
    const migrationScript = [
      '-- 🔧 COLUMN MIGRATION SCRIPT FOR HEROKU',
      `-- Generated: ${new Date().toISOString()}`,
      '-- Execute these commands on Heroku Postgres to add missing columns',
      '',
      '-- ⚠️  BACKUP FIRST: heroku pg:backups:capture --app your-app-name',
      '',
      '-- ===== MISSING COLUMN ADDITIONS =====',
      '',
      ...this.migrationCommands,
      '',
      '-- ===== VERIFICATION QUERIES =====',
      '-- Run these after migration to verify columns were added:',
      '',
      ...Object.keys(this.missingColumns).map(table => `
-- Check ${table} columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = '${table}' 
ORDER BY ordinal_position;`
      ),
      '',
      '-- ===== ROLLBACK PLAN (if needed) =====',
      '-- Uncomment and run these ONLY if you need to rollback:',
      '',
      ...Object.entries(this.missingColumns).flatMap(([table, columns]) =>
        columns.map(col => `-- ALTER TABLE ${table} DROP COLUMN IF EXISTS ${col.column_name};`)
      )
    ].join('\n');

    console.log('📝 COLUMN MIGRATION SCRIPT GENERATED:');
    console.log('═'.repeat(60));
    console.log(migrationScript);
    console.log('═'.repeat(60));
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, filename);
    fs.writeFileSync(scriptPath, migrationScript);
    console.log(`💾 Column migration script saved to: ${scriptPath}`);
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
    console.log('🔍 COLUMN COMPARISON ANALYSIS');
    console.log('═'.repeat(60));
    console.log(`Local DB: ${LOCAL_DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
    console.log(`Heroku DB: ${HEROKU_DATABASE_URL ? HEROKU_DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'Not configured'}`);
    console.log('═'.repeat(60));
    console.log('');

    try {
      await this.connect();
      
      // Check each table that exists in both databases
      const commonTables = Object.keys(EXPECTED_COLUMNS);
      for (const tableName of commonTables) {
        await this.checkTable(tableName);
      }
      
      // Generate migration script
      await this.generateMigrationScript();
      
      // Summary
      console.log('📊 COLUMN ANALYSIS SUMMARY:');
      console.log('─'.repeat(40));
      console.log(`Tables checked: ${commonTables.length}`);
      console.log(`Tables with missing columns: ${Object.keys(this.missingColumns).length}`);
      console.log(`Total missing columns: ${Object.values(this.missingColumns).flat().length}`);
      console.log(`Migration commands generated: ${this.migrationCommands.length}`);
      
      if (Object.keys(this.missingColumns).length > 0) {
        console.log('\n🔴 Tables needing column additions:');
        Object.entries(this.missingColumns).forEach(([table, columns]) => {
          console.log(`   - ${table}: ${columns.length} missing columns`);
        });
      }
      
    } catch (error) {
      console.error('💥 Column analysis failed:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// 🚀 RUN COLUMN CHECK
if (require.main === module) {
  const checker = new ColumnChecker();
  checker.run().catch(console.error);
}

module.exports = ColumnChecker;
