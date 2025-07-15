#!/usr/bin/env node

/**
 * 🔄 KUSTODIA DATA MIGRATION SCRIPT
 * 
 * Migrates data from local PostgreSQL to Heroku production database
 * - Exports essential data from local DB
 * - Safely imports to production with validation
 * - Preserves data integrity and relationships
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configurations
const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'kustodia',
  user: 'postgres',
  password: '140290'
};

const PRODUCTION_DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

class DataMigrator {
  constructor() {
    this.localClient = null;
    this.prodClient = null;
    this.migrationLog = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.migrationLog.push(logEntry);
  }

  async connectDatabases() {
    try {
      // Connect to local database
      this.localClient = new Client(LOCAL_DB_CONFIG);
      await this.localClient.connect();
      this.log('Connected to local PostgreSQL database');

      // Connect to production database
      this.prodClient = new Client(PRODUCTION_DB_CONFIG);
      await this.prodClient.connect();
      this.log('Connected to Heroku production database');

      return true;
    } catch (error) {
      this.log(`Failed to connect to databases: ${error.message}`, 'error');
      return false;
    }
  }

  async exportTableData(tableName, conditions = '') {
    try {
      const query = `SELECT * FROM "${tableName}" ${conditions}`;
      const result = await this.localClient.query(query);
      this.log(`Exported ${result.rows.length} records from ${tableName}`);
      return result.rows;
    } catch (error) {
      this.log(`Failed to export from ${tableName}: ${error.message}`, 'error');
      return [];
    }
  }

  async getTableSchema(tableName) {
    try {
      const query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `;
      const result = await this.prodClient.query(query, [tableName]);
      return result.rows;
    } catch (error) {
      this.log(`Failed to get schema for ${tableName}: ${error.message}`, 'error');
      return [];
    }
  }

  async importTableData(tableName, data, conflictResolution = 'skip') {
    if (data.length === 0) {
      this.log(`No data to import for ${tableName}`, 'warn');
      return 0;
    }

    try {
      const schema = await this.getTableSchema(tableName);
      const columns = schema.map(col => col.column_name);
      
      let successCount = 0;
      let skipCount = 0;

      for (const row of data) {
        try {
          // Filter row data to match table schema
          const filteredRow = {};
          columns.forEach(col => {
            if (row[col] !== undefined) {
              filteredRow[col] = row[col];
            }
          });

          const columnNames = Object.keys(filteredRow);
          const values = Object.values(filteredRow);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

          let query;
          if (conflictResolution === 'upsert' && tableName !== 'user') {
            // Use ON CONFLICT for most tables
            query = `
              INSERT INTO "${tableName}" (${columnNames.join(', ')})
              VALUES (${placeholders})
              ON CONFLICT (id) DO UPDATE SET
              ${columnNames.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
            `;
          } else {
            // Simple insert with conflict skip
            query = `
              INSERT INTO "${tableName}" (${columnNames.join(', ')})
              VALUES (${placeholders})
              ON CONFLICT DO NOTHING
            `;
          }

          await this.prodClient.query(query, values);
          successCount++;
        } catch (rowError) {
          skipCount++;
          if (rowError.code !== '23505') { // Not a duplicate key error
            this.log(`Error importing row to ${tableName}: ${rowError.message}`, 'warn');
          }
        }
      }

      this.log(`Imported ${successCount} records to ${tableName} (${skipCount} skipped)`);
      return successCount;
    } catch (error) {
      this.log(`Failed to import to ${tableName}: ${error.message}`, 'error');
      return 0;
    }
  }

  async migrateEssentialData() {
    this.log('🚀 Starting data migration to production...');

    // Migration order (respecting foreign key dependencies)
    const migrationTables = [
      { name: 'user', condition: 'WHERE email != \'test@example.com\'', conflict: 'skip' },
      { name: 'payment', condition: '', conflict: 'upsert' },
      { name: 'escrow', condition: '', conflict: 'upsert' },
      { name: 'notification', condition: '', conflict: 'skip' },
      { name: 'early_access_counter', condition: '', conflict: 'upsert' },
      { name: 'ticket', condition: '', conflict: 'skip' }
    ];

    let totalRecords = 0;

    for (const table of migrationTables) {
      this.log(`\n📊 Migrating table: ${table.name}`);
      
      // Export from local
      const data = await this.exportTableData(table.name, table.condition);
      
      // Import to production
      const imported = await this.importTableData(table.name, data, table.conflict);
      totalRecords += imported;
    }

    this.log(`\n✅ Migration completed! Total records migrated: ${totalRecords}`);
    return totalRecords;
  }

  async validateMigration() {
    this.log('\n🔍 Validating migration...');

    const tables = ['user', 'payment', 'escrow', 'notification'];
    
    for (const table of tables) {
      try {
        const localCount = await this.localClient.query(`SELECT COUNT(*) FROM "${table}"`);
        const prodCount = await this.prodClient.query(`SELECT COUNT(*) FROM "${table}"`);
        
        this.log(`${table}: Local=${localCount.rows[0].count}, Production=${prodCount.rows[0].count}`);
      } catch (error) {
        this.log(`Error validating ${table}: ${error.message}`, 'warn');
      }
    }
  }

  async saveMigrationLog() {
    const logPath = path.join(__dirname, '..', 'logs', `migration_${Date.now()}.log`);
    
    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    fs.writeFileSync(logPath, this.migrationLog.join('\n'));
    this.log(`Migration log saved to: ${logPath}`);
  }

  async disconnect() {
    if (this.localClient) {
      await this.localClient.end();
      this.log('Disconnected from local database');
    }
    if (this.prodClient) {
      await this.prodClient.end();
      this.log('Disconnected from production database');
    }
  }

  async migrate() {
    try {
      const connected = await this.connectDatabases();
      if (!connected) {
        throw new Error('Failed to connect to databases');
      }

      await this.migrateEssentialData();
      await this.validateMigration();
      
      return true;
    } catch (error) {
      this.log(`Migration failed: ${error.message}`, 'error');
      return false;
    } finally {
      await this.saveMigrationLog();
      await this.disconnect();
    }
  }
}

// Execute migration if run directly
if (require.main === module) {
  console.log('🔄 KUSTODIA DATA MIGRATION TO PRODUCTION');
  console.log('=========================================\n');

  const migrator = new DataMigrator();
  migrator.migrate()
    .then(success => {
      if (success) {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Migration failed. Check logs for details.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Critical migration error:', error);
      process.exit(1);
    });
}

module.exports = { DataMigrator };
