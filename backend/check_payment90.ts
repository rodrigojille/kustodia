require('dotenv').config();
import AppDataSource from './src/ormconfig';

async function checkPayment90() {
  try {
    await AppDataSource.initialize();
    const result = await AppDataSource.query('SELECT id, status, amount, reference FROM payment WHERE id = 90');
    console.log('Payment 90 Status:', JSON.stringify(result[0], null, 2));
    
    // Also check payment events for Payment 90
    const events = await AppDataSource.query(`
      SELECT type, description, created_at 
      FROM payment_event 
      WHERE "paymentId" = 90 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('\nRecent Payment 90 Events:');
    events.forEach((event: any) => {
      console.log(`- ${event.type}: ${event.description} (${event.created_at})`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPayment90();
