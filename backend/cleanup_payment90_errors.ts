require('dotenv').config();
import AppDataSource from './src/ormconfig';

async function cleanupPayment90Errors() {
  try {
    console.log('🧹 Cleaning up automation_error events from Payment 90...');
    
    await AppDataSource.initialize();
    
    // Delete the 2 automation_error events for Payment 90
    const result = await AppDataSource.query(`
      DELETE FROM payment_event 
      WHERE "paymentId" = 90 
      AND type = 'automation_error' 
      AND description LIKE '%Juno withdrawal failed%'
    `);
    
    console.log(`✅ Deleted ${result[1]} automation_error events from Payment 90`);
    
    // Show updated timeline
    console.log('\n📋 Updated Payment 90 Timeline:');
    const events = await AppDataSource.query(`
      SELECT type, description, created_at 
      FROM payment_event 
      WHERE "paymentId" = 90 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    events.forEach((event: any) => {
      console.log(`- ${event.type}: ${event.description} (${event.created_at})`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupPayment90Errors();
