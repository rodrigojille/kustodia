// Payment Migration Execution Script
// Safely migrates payment statuses with proper validation and logging

const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

// Migration configuration
const MIGRATIONS = [
  {
    paymentId: 112,
    description: 'Payment 112 - Update to completed if escrow released',
    checks: [
      { field: 'escrow.release_tx_hash', condition: 'NOT_NULL' },
      { field: 'status', condition: 'NOT_EQUALS', value: 'completed' }
    ],
    actions: [
      { type: 'UPDATE_STATUS', value: 'completed' },
      { type: 'ADD_EVENT', eventType: 'status_corrected', description: 'Estado corregido automáticamente - pago completado tras liberación de custodia' }
    ]
  },
  {
    paymentId: 113,
    description: 'Payment 113 - Update to completed if escrow released',
    checks: [
      { field: 'escrow.release_tx_hash', condition: 'NOT_NULL' },
      { field: 'status', condition: 'NOT_EQUALS', value: 'completed' }
    ],
    actions: [
      { type: 'UPDATE_STATUS', value: 'completed' },
      { type: 'ADD_EVENT', eventType: 'status_corrected', description: 'Estado corregido automáticamente - pago completado tras liberación de custodia' }
    ]
  }
];

// Additional migration patterns for bulk fixes
const BULK_MIGRATIONS = [
  {
    name: 'Released Escrows Not Completed',
    description: 'Fix payments with released escrows but not completed status',
    query: {
      joins: ['escrow'],
      where: [
        'escrow.release_tx_hash IS NOT NULL',
        'payment.status != :completedStatus'
      ],
      parameters: { completedStatus: 'completed' }
    },
    actions: [
      { type: 'UPDATE_STATUS', value: 'completed' },
      { type: 'ADD_EVENT', eventType: 'status_corrected', description: 'Estado corregido automáticamente - pago completado tras liberación de custodia' }
    ]
  },
  {
    name: 'Approved Nuevo Flujo Not Released',
    description: 'Find nuevo_flujo payments with both approvals but not released (for manual review)',
    query: {
      joins: ['escrow'],
      where: [
        'payment.payment_type = :paymentType',
        'payment.payer_approval = true',
        'payment.payee_approval = true',
        'escrow.release_tx_hash IS NULL'
      ],
      parameters: { paymentType: 'nuevo_flujo' }
    },
    actions: [
      { type: 'ADD_EVENT', eventType: 'migration_review', description: 'Pago marcado para revisión - ambas aprobaciones recibidas pero custodia no liberada' }
    ]
  },
  {
    name: 'Stuck Processing Payments',
    description: 'Find payments stuck in processing for >24h',
    query: {
      joins: [],
      where: [
        'payment.status = :processingStatus',
        'payment.updated_at < :cutoffDate'
      ],
      parameters: { 
        processingStatus: 'processing',
        cutoffDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      }
    },
    actions: [
      { type: 'ADD_EVENT', eventType: 'migration_review', description: 'Pago marcado para revisión - en procesamiento por más de 24 horas' }
    ]
  }
];

// Helper functions
async function validateMigrationChecks(payment, checks) {
  for (const check of checks) {
    const value = getNestedValue(payment, check.field);
    
    switch (check.condition) {
      case 'NOT_NULL':
        if (value === null || value === undefined) return false;
        break;
      case 'IS_NULL':
        if (value !== null && value !== undefined) return false;
        break;
      case 'EQUALS':
        if (value !== check.value) return false;
        break;
      case 'NOT_EQUALS':
        if (value === check.value) return false;
        break;
      default:
        console.warn(`Unknown condition: ${check.condition}`);
        return false;
    }
  }
  return true;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

async function executeActions(payment, actions, paymentRepo, eventRepo) {
  const results = [];
  
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'UPDATE_STATUS':
          const oldStatus = payment.status;
          payment.status = action.value;
          payment.updated_at = new Date();
          await paymentRepo.save(payment);
          results.push(`Status updated: ${oldStatus} → ${action.value}`);
          break;
          
        case 'ADD_EVENT':
          const newEvent = new PaymentEvent();
          newEvent.payment = payment;
          newEvent.paymentId = payment.id;
          newEvent.type = action.eventType;
          newEvent.description = action.description;
          newEvent.is_automatic = true;
          newEvent.created_at = new Date();
          await eventRepo.save(newEvent);
          results.push(`Event added: ${action.eventType}`);
          break;
          
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      results.push(`Error executing ${action.type}: ${error.message}`);
    }
  }
  
  return results;
}

async function executeMigration(migration, dryRun = true) {
  console.log(`\n🔄 Processing: ${migration.description}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
  
  const paymentRepo = AppDataSource.getRepository(Payment);
  const eventRepo = AppDataSource.getRepository(PaymentEvent);
  
  try {
    // Get payment with relations
    const payment = await paymentRepo.findOne({
      where: { id: migration.paymentId },
      relations: ['escrow']
    });
    
    if (!payment) {
      console.log(`   ❌ Payment ${migration.paymentId} not found`);
      return { success: false, reason: 'Payment not found' };
    }
    
    console.log(`   📊 Current Status: ${payment.status}`);
    console.log(`   📊 Escrow Release TX: ${payment.escrow?.release_tx_hash || 'None'}`);
    
    // Validate checks
    const checksPass = await validateMigrationChecks(payment, migration.checks);
    if (!checksPass) {
      console.log(`   ✅ No migration needed - checks not met`);
      return { success: true, reason: 'Checks not met', skipped: true };
    }
    
    console.log(`   ✅ Migration checks passed`);
    
    if (!dryRun) {
      // Execute actions
      const results = await executeActions(payment, migration.actions, paymentRepo, eventRepo);
      console.log(`   📝 Actions executed:`);
      results.forEach(result => console.log(`      - ${result}`));
      return { success: true, results };
    } else {
      console.log(`   📝 Would execute:`);
      migration.actions.forEach(action => {
        console.log(`      - ${action.type}: ${action.value || action.eventType}`);
      });
      return { success: true, dryRun: true };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function executeBulkMigration(bulkMigration, dryRun = true) {
  console.log(`\n🔄 Processing Bulk: ${bulkMigration.name}`);
  console.log(`   Description: ${bulkMigration.description}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
  
  const paymentRepo = AppDataSource.getRepository(Payment);
  const eventRepo = AppDataSource.getRepository(PaymentEvent);
  
  try {
    // Build query
    let query = paymentRepo.createQueryBuilder('payment');
    
    // Add joins
    bulkMigration.query.joins.forEach(join => {
      query = query.leftJoinAndSelect(`payment.${join}`, join);
    });
    
    // Add where conditions
    bulkMigration.query.where.forEach((condition, index) => {
      if (index === 0) {
        query = query.where(condition, bulkMigration.query.parameters);
      } else {
        query = query.andWhere(condition, bulkMigration.query.parameters);
      }
    });
    
    const payments = await query.getMany();
    console.log(`   📊 Found ${payments.length} payments matching criteria`);
    
    if (payments.length === 0) {
      return { success: true, count: 0, reason: 'No payments found' };
    }
    
    // Show payment details
    payments.forEach(payment => {
      console.log(`      Payment ${payment.id}: Status '${payment.status}', Type '${payment.payment_type || 'traditional'}'`);
    });
    
    if (!dryRun) {
      let successCount = 0;
      let errorCount = 0;
      
      for (const payment of payments) {
        try {
          const results = await executeActions(payment, bulkMigration.actions, paymentRepo, eventRepo);
          console.log(`      ✅ Payment ${payment.id}: ${results.join(', ')}`);
          successCount++;
        } catch (error) {
          console.log(`      ❌ Payment ${payment.id}: ${error.message}`);
          errorCount++;
        }
      }
      
      return { success: true, total: payments.length, successCount, errorCount };
    } else {
      console.log(`   📝 Would execute for each payment:`);
      bulkMigration.actions.forEach(action => {
        console.log(`      - ${action.type}: ${action.value || action.eventType}`);
      });
      return { success: true, dryRun: true, count: payments.length };
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runMigrations(dryRun = true) {
  console.log('🚀 PAYMENT MIGRATION EXECUTION');
  console.log('=' .repeat(80));
  console.log(`Mode: ${dryRun ? '🧪 DRY RUN (No changes will be made)' : '⚡ LIVE EXECUTION'}`);
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
    const results = {
      specific: [],
      bulk: []
    };
    
    // Execute specific migrations
    console.log('\n📋 SPECIFIC PAYMENT MIGRATIONS:');
    for (const migration of MIGRATIONS) {
      const result = await executeMigration(migration, dryRun);
      results.specific.push({ migration: migration.paymentId, ...result });
    }
    
    // Execute bulk migrations
    console.log('\n📋 BULK MIGRATION PATTERNS:');
    for (const bulkMigration of BULK_MIGRATIONS) {
      const result = await executeBulkMigration(bulkMigration, dryRun);
      results.bulk.push({ name: bulkMigration.name, ...result });
    }
    
    // Summary
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`   Specific migrations: ${results.specific.length}`);
    console.log(`   Bulk patterns: ${results.bulk.length}`);
    
    if (dryRun) {
      console.log('\n⚠️  This was a DRY RUN. No changes were made.');
      console.log('   To execute migrations, run with: node execute_payment_migrations.js --live');
    } else {
      console.log('\n✅ Migration execution completed.');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Command line execution
const args = process.argv.slice(2);
const isLive = args.includes('--live');

runMigrations(!isLive).catch(console.error);
