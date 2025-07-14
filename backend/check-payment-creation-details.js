require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function checkPaymentCreationDetails() {
  console.log('🔍 Checking payment creation details for 112 and 113...');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Get detailed payment and escrow information
    const query = `
      SELECT 
        p.id as payment_id,
        p.amount,
        p.status,
        p.payment_type,
        p.vertical_type,
        p.created_at as payment_created,
        p.payer_email,
        p.recipient_email,
        e.id as escrow_id,
        e.smart_contract_escrow_id,
        e.custody_percent,
        e.custody_amount,
        e.release_amount,
        e.status as escrow_status,
        e.created_at as escrow_created,
        e.custody_end,
        EXTRACT(EPOCH FROM (e.custody_end - e.created_at)) as custody_period_seconds
      FROM payment p
      JOIN escrow e ON p.escrow_id = e.id
      WHERE p.id IN (112, 113)
      ORDER BY p.id;
    `;
    
    const results = await AppDataSource.query(query);
    
    console.log('\n📊 Payment Creation Analysis:');
    results.forEach(row => {
      console.log(`\n--- Payment ${row.payment_id} ---`);
      console.log(`Basic Info:`);
      console.log(`  - Amount: $${row.amount}`);
      console.log(`  - Type: ${row.payment_type}`);
      console.log(`  - Vertical: ${row.vertical_type}`);
      console.log(`  - Payer: ${row.payer_email}`);
      console.log(`  - Recipient: ${row.recipient_email}`);
      console.log(`  - Created: ${row.payment_created}`);
      
      console.log(`Escrow Details:`);
      console.log(`  - Escrow ID: ${row.escrow_id}`);
      console.log(`  - Smart Contract ID: ${row.smart_contract_escrow_id}`);
      console.log(`  - Custody %: ${row.custody_percent}%`);
      console.log(`  - Custody Amount: $${row.custody_amount}`);
      console.log(`  - Release Amount: $${row.release_amount}`);
      console.log(`  - Status: ${row.escrow_status}`);
      console.log(`  - Created: ${row.escrow_created}`);
      console.log(`  - Custody End: ${row.custody_end}`);
      
      const custodyPeriodSeconds = parseFloat(row.custody_period_seconds);
      const custodyPeriodHours = custodyPeriodSeconds / 3600;
      const custodyPeriodDays = custodyPeriodHours / 24;
      
      console.log(`Custody Period Analysis:`);
      console.log(`  - Period in seconds: ${custodyPeriodSeconds}`);
      console.log(`  - Period in hours: ${custodyPeriodHours.toFixed(2)}`);
      console.log(`  - Period in days: ${custodyPeriodDays.toFixed(2)}`);
      
      // Check if this matches common day values
      if (Math.abs(custodyPeriodDays - 1) < 0.1) {
        console.log(`  - ✅ Matches 1 day custody`);
      } else if (Math.abs(custodyPeriodDays - 2) < 0.1) {
        console.log(`  - ✅ Matches 2 day custody`);
      } else if (Math.abs(custodyPeriodDays - 5) < 0.1) {
        console.log(`  - ✅ Matches 5 day custody (default)`);
      } else {
        console.log(`  - ⚠️ Custom custody period`);
      }
      
      // Check what the frontend would have sent
      const expectedDaysInput = Math.round(custodyPeriodDays);
      const frontendSeconds = expectedDaysInput * 24 * 60 * 60;
      console.log(`Frontend Analysis:`);
      console.log(`  - User likely input: ${expectedDaysInput} days`);
      console.log(`  - Frontend would send: ${frontendSeconds} seconds`);
      console.log(`  - Matches actual: ${Math.abs(frontendSeconds - custodyPeriodSeconds) < 1000 ? '✅ Yes' : '❌ No'}`);
    });

    // Check for any payment events that might show the original request
    console.log('\n📋 Payment Events:');
    const eventsQuery = `
      SELECT pe.payment_id, pe.event_type, pe.description, pe.created_at
      FROM payment_event pe
      WHERE pe.payment_id IN (112, 113)
      ORDER BY pe.payment_id, pe.created_at;
    `;
    
    const events = await AppDataSource.query(eventsQuery);
    events.forEach(event => {
      console.log(`Payment ${event.payment_id}: ${event.event_type} - ${event.description} (${event.created_at})`);
    });

  } catch (error) {
    console.error('❌ Error checking payment details:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
checkPaymentCreationDetails();
