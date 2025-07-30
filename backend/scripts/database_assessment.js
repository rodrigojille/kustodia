// 🔍 DATABASE STRUCTURE ASSESSMENT SCRIPT
// This script analyzes our local database structure vs production requirements
// to identify missing tables, columns, or other elements before deployment

const { Client } = require('pg');
require('dotenv').config();

// Database configurations
const LOCAL_DATABASE_URL = process.env.DATABASE_URL;
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL_PRODUCTION;

// Expected database structure based on our entities
const EXPECTED_TABLES = {
  'user': {
    columns: [
      'id', 'email', 'password_hash', 'full_name', 'kyc_status', 
      'wallet_address', 'portal_client_id', 'portal_share', 'googleId',
      'googleAccessToken', 'googleRefreshToken', 'mxnb_balance', 'role',
      'deposit_clabe', 'payout_clabe', 'juno_bank_account_id', 'email_verified',
      'email_verification_token', 'password_reset_token', 'truora_process_id',
      'password_reset_expires', 'created_at', 'updated_at'
    ],
    indexes: ['email_unique', 'googleId_unique']
  },
  'payment': {
    columns: [
      'id', 'user_id', 'seller_id', 'recipient_email', 'payer_email', 'amount',
      'currency', 'description', 'reference', 'transaction_id', 'juno_transaction_id',
      'blockchain_tx_hash', 'bitso_tracking_number', 'travel_rule_data',
      'deposit_clabe', 'payout_clabe', 'payout_juno_bank_account_id', 'juno_payment_id',
      'commission_percent', 'commission_amount', 'platform_commission_percent',
      'platform_commission_amount', 'platform_commission_beneficiary_email',
      'commission_beneficiary_name', 'commission_beneficiary_email',
      'commission_beneficiary_clabe', 'commission_beneficiary_juno_bank_account_id',
      'payer_clabe', 'status', 'payment_type', 'payer_approval', 'payee_approval',
      'payer_approval_timestamp', 'payee_approval_timestamp', 'release_conditions',
      'vertical_type', 'operation_type', 'initiator_type', 'transaction_subtype',
      // Vehicle fields
      'vehicle_brand', 'vehicle_model', 'vehicle_year', 'vehicle_vin',
      'vehicle_mileage', 'vehicle_condition',
      // Electronics fields
      'electronics_brand', 'electronics_model', 'electronics_condition',
      'electronics_warranty', 'electronics_serial',
      // Appliances fields
      'appliance_type', 'appliance_brand', 'appliance_years_use',
      'appliance_efficiency', 'appliance_condition', 'appliance_serial',
      // Furniture fields
      'furniture_type', 'furniture_material', 'furniture_dimensions',
      'furniture_condition',
      'escrow_id', 'created_at', 'updated_at'
    ],
    indexes: ['user_id_idx', 'seller_id_idx', 'status_idx', 'payment_type_idx']
  },
  'escrow': {
    columns: [
      'id', 'payment_id', 'smart_contract_escrow_id', 'blockchain_tx_hash',
      'release_tx_hash', 'custody_percent', 'custody_amount', 'release_amount',
      'status', 'dispute_status', 'dispute_reason', 'dispute_details',
      'dispute_evidence', 'dispute_history', 'custody_end', 'created_at', 'updated_at'
    ],
    indexes: ['payment_id_idx', 'status_idx']
  },
  'commission_recipients': {
    columns: [
      'id', 'payment_id', 'broker_email', 'broker_name', 'broker_percentage',
      'broker_amount', 'paid', 'paid_at', 'payment_transaction_id',
      'created_at', 'updated_at'
    ],
    indexes: ['payment_id_idx']
  },
  'juno_transaction': {
    columns: [
      'id', 'type', 'reference', 'amount', 'status', 'tx_hash',
      'created_at', 'updated_at'
    ],
    indexes: ['type_idx', 'status_idx']
  },
  'wallet_transaction': {
    columns: [
      'id', 'user_id', 'type', 'status', 'amount_mxn', 'amount_mxnb',
      'bridge_address', 'bridge_tx_hash', 'juno_transaction_id',
      'spei_tracking_key', 'created_at', 'updated_at'
    ],
    indexes: ['user_id_idx', 'type_idx', 'status_idx']
  },
  'notification': {
    columns: [
      'id', 'user_id', 'message', 'link', 'type', 'category', 'read',
      'payment_id', 'createdAt'
    ],
    indexes: ['user_id_idx', 'read_idx', 'payment_id_idx']
  },
  'dispute': {
    columns: [
      'id', 'payment_id', 'complainant_id', 'defendant_id', 'reason',
      'description', 'status', 'resolution', 'created_at', 'updated_at'
    ],
    indexes: ['payment_id_idx', 'status_idx']
  },
  'dispute_message': {
    columns: [
      'id', 'dispute_id', 'sender_id', 'message', 'attachment_url',
      'created_at', 'updated_at'
    ],
    indexes: ['dispute_id_idx']
  },
  'payment_event': {
    columns: [
      'id', 'payment_id', 'event_type', 'event_data', 'created_at'
    ],
    indexes: ['payment_id_idx', 'event_type_idx']
  },
  'ticket': {
    columns: [
      'id', 'user_id', 'subject', 'description', 'status', 'priority',
      'created_at', 'updated_at'
    ],
    indexes: ['user_id_idx', 'status_idx']
  },
  'ticket_reply': {
    columns: [
      'id', 'ticket_id', 'user_id', 'message', 'is_admin_reply',
      'created_at', 'updated_at'
    ],
    indexes: ['ticket_id_idx']
  },
  'token': {
    columns: [
      'id', 'token', 'user_id', 'expires_at', 'created_at'
    ],
    indexes: ['token_idx', 'user_id_idx']
  },
  'lead': {
    columns: [
      'id', 'email', 'phone', 'company', 'message', 'source',
      'created_at', 'updated_at'
    ],
    indexes: ['email_idx', 'source_idx']
  },
  'early_access_counter': {
    columns: [
      'id', 'count', 'updated_at'
    ]
  }
};

async function analyzeDatabase(databaseUrl, label) {
  console.log(`\n🔍 Analyzing ${label} Database Structure`);
  console.log('='.repeat(50));
  
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log(`📋 Found ${existingTables.length} tables:`, existingTables.join(', '));
    
    const analysis = {
      tables: {},
      missingTables: [],
      extraTables: []
    };
    
    // Check each expected table
    for (const [tableName, tableSpec] of Object.entries(EXPECTED_TABLES)) {
      if (existingTables.includes(tableName)) {
        // Get columns for this table
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position;
        `, [tableName]);
        
        const existingColumns = columnsResult.rows.map(row => row.column_name);
        const missingColumns = tableSpec.columns.filter(col => !existingColumns.includes(col));
        const extraColumns = existingColumns.filter(col => !tableSpec.columns.includes(col));
        
        analysis.tables[tableName] = {
          exists: true,
          columns: existingColumns,
          missingColumns,
          extraColumns,
          columnDetails: columnsResult.rows
        };
        
        if (missingColumns.length > 0) {
          console.log(`⚠️  Table '${tableName}' missing columns:`, missingColumns.join(', '));
        }
        if (extraColumns.length > 0) {
          console.log(`ℹ️  Table '${tableName}' has extra columns:`, extraColumns.join(', '));
        }
      } else {
        analysis.missingTables.push(tableName);
        analysis.tables[tableName] = { exists: false };
      }
    }
    
    // Check for extra tables
    analysis.extraTables = existingTables.filter(table => !Object.keys(EXPECTED_TABLES).includes(table));
    
    if (analysis.missingTables.length > 0) {
      console.log(`❌ Missing tables:`, analysis.missingTables.join(', '));
    }
    
    if (analysis.extraTables.length > 0) {
      console.log(`ℹ️  Extra tables:`, analysis.extraTables.join(', '));
    }
    
    // Get indexes
    const indexesResult = await client.query(`
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique
      FROM 
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
      WHERE 
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname IN (${Object.keys(EXPECTED_TABLES).map((_, i) => `$${i + 1}`).join(',')})
      ORDER BY t.relname, i.relname;
    `, Object.keys(EXPECTED_TABLES));
    
    console.log(`🔗 Found ${indexesResult.rows.length} indexes`);
    
    await client.end();
    return analysis;
    
  } catch (error) {
    console.error(`❌ Error analyzing ${label} database:`, error.message);
    await client.end();
    return null;
  }
}

async function compareStructures() {
  console.log('🚀 DATABASE STRUCTURE ASSESSMENT');
  console.log('='.repeat(60));
  console.log('Comparing local vs production database structures...\n');
  
  // Analyze local database
  const localAnalysis = await analyzeDatabase(LOCAL_DATABASE_URL, 'LOCAL');
  
  if (!localAnalysis) {
    console.log('❌ Could not analyze local database. Exiting.');
    return;
  }
  
  // Generate migration recommendations
  console.log('\n📝 MIGRATION RECOMMENDATIONS');
  console.log('='.repeat(50));
  
  if (localAnalysis.missingTables.length > 0) {
    console.log('\n🔧 REQUIRED: Create missing tables:');
    localAnalysis.missingTables.forEach(table => {
      console.log(`   - CREATE TABLE ${table}`);
    });
  }
  
  let hasColumnChanges = false;
  Object.entries(localAnalysis.tables).forEach(([tableName, tableInfo]) => {
    if (tableInfo.exists && tableInfo.missingColumns && tableInfo.missingColumns.length > 0) {
      if (!hasColumnChanges) {
        console.log('\n🔧 REQUIRED: Add missing columns:');
        hasColumnChanges = true;
      }
      console.log(`   - ALTER TABLE ${tableName} ADD COLUMNS: ${tableInfo.missingColumns.join(', ')}`);
    }
  });
  
  // Check for critical payment flow columns
  const criticalColumns = {
    'payment': ['payer_approval', 'payee_approval', 'payment_type', 'vertical_type', 'escrow_id'],
    'escrow': ['custody_percent', 'custody_amount', 'smart_contract_escrow_id'],
    'commission_recipients': ['broker_email', 'broker_percentage', 'broker_amount'],
    'user': ['portal_client_id', 'portal_share', 'wallet_address', 'mxnb_balance']
  };
  
  console.log('\n🎯 CRITICAL PAYMENT FLOW COLUMNS CHECK:');
  console.log('='.repeat(50));
  
  let criticalIssues = false;
  Object.entries(criticalColumns).forEach(([tableName, columns]) => {
    const tableInfo = localAnalysis.tables[tableName];
    if (tableInfo && tableInfo.exists) {
      const missingCritical = columns.filter(col => 
        tableInfo.missingColumns && tableInfo.missingColumns.includes(col)
      );
      if (missingCritical.length > 0) {
        console.log(`❌ CRITICAL: Table '${tableName}' missing: ${missingCritical.join(', ')}`);
        criticalIssues = true;
      } else {
        console.log(`✅ Table '${tableName}' has all critical columns`);
      }
    } else {
      console.log(`❌ CRITICAL: Table '${tableName}' does not exist`);
      criticalIssues = true;
    }
  });
  
  if (!criticalIssues) {
    console.log('\n🎉 All critical payment flow columns are present!');
  }
  
  // Generate TypeORM migration command
  console.log('\n🛠️  NEXT STEPS:');
  console.log('='.repeat(50));
  console.log('1. Generate TypeORM migration:');
  console.log('   npm run typeorm migration:generate -- -n SyncProductionStructure');
  console.log('');
  console.log('2. Review generated migration file');
  console.log('');
  console.log('3. Run migration:');
  console.log('   npm run typeorm migration:run');
  console.log('');
  console.log('4. Test payment creation flows');
  console.log('');
  
  return localAnalysis;
}

// Run the assessment
if (require.main === module) {
  compareStructures().catch(console.error);
}

module.exports = { compareStructures, analyzeDatabase };
