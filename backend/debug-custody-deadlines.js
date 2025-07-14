require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function debugCustodyDeadlines() {
  console.log('🔍 Debugging custody deadline calculations...');
  console.log(`Current time: ${new Date().toISOString()}`);
  console.log(`Current Unix timestamp: ${Math.floor(Date.now() / 1000)}`);
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // Check recent nuevo_flujo payments and their escrows
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);

    const nuevoFlujoPayments = await paymentRepo.find({
      where: { payment_type: 'nuevo_flujo' },
      order: { created_at: 'DESC' },
      take: 5
    });

    console.log('\n📊 Nuevo Flujo Payments Analysis:');
    
    for (const payment of nuevoFlujoPayments) {
      console.log(`\n--- Payment ${payment.id} ---`);
      console.log(`Amount: ${payment.amount}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Created: ${payment.created_at}`);
      console.log(`Escrow ID: ${payment.escrow_id}`);
      
      if (payment.escrow_id) {
        const escrow = await escrowRepo.findOne({
          where: { id: payment.escrow_id }
        });
        
        if (escrow) {
          console.log(`\n🔒 Escrow ${escrow.id} Details:`);
          console.log(`  - Status: ${escrow.status}`);
          console.log(`  - Custody %: ${escrow.custody_percent}%`);
          console.log(`  - Custody Amount: ${escrow.custody_amount}`);
          console.log(`  - Release Amount: ${escrow.release_amount}`);
          console.log(`  - Created: ${escrow.created_at}`);
          console.log(`  - Custody End: ${escrow.custody_end}`);
          
          // Calculate expected vs actual custody end
          const escrowCreatedTime = new Date(escrow.created_at);
          const custodyEndTime = new Date(escrow.custody_end);
          const timeDiffMs = custodyEndTime.getTime() - escrowCreatedTime.getTime();
          const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
          const timeDiffDays = timeDiffHours / 24;
          
          console.log(`\n⏰ Timing Analysis:`);
          console.log(`  - Escrow created: ${escrowCreatedTime.toISOString()}`);
          console.log(`  - Custody ends: ${custodyEndTime.toISOString()}`);
          console.log(`  - Time difference: ${timeDiffHours.toFixed(2)} hours (${timeDiffDays.toFixed(2)} days)`);
          
          // Check if custody end is in the future
          const now = new Date();
          const isInFuture = custodyEndTime > now;
          const timeUntilEnd = custodyEndTime.getTime() - now.getTime();
          const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);
          
          console.log(`  - Is in future: ${isInFuture}`);
          if (isInFuture) {
            console.log(`  - Hours until end: ${hoursUntilEnd.toFixed(2)}`);
          } else {
            console.log(`  - Hours past end: ${Math.abs(hoursUntilEnd).toFixed(2)}`);
          }
          
          // Convert to Unix timestamp for smart contract
          const unixTimestamp = Math.floor(custodyEndTime.getTime() / 1000);
          console.log(`  - Unix timestamp: ${unixTimestamp}`);
          
          // Check if smart contract was created
          if (escrow.smart_contract_escrow_id) {
            console.log(`  - Smart contract ID: ${escrow.smart_contract_escrow_id}`);
            console.log(`  - Blockchain TX: ${escrow.blockchain_tx_hash || 'None'}`);
          } else {
            console.log(`  - ⚠️ No smart contract created yet`);
          }
        } else {
          console.log(`❌ Escrow ${payment.escrow_id} not found`);
        }
      } else {
        console.log(`⚠️ No escrow associated`);
      }
    }

    // Check the payment controller logic for custody calculation
    console.log('\n🔧 Payment Controller Logic Check:');
    console.log('Expected custody calculation:');
    console.log('1. Frontend sends: custody_percent (1-100%) and custody_period (1-365 days)');
    console.log('2. Backend calculates: custody_end = created_at + (custody_period * 24 * 60 * 60 * 1000)');
    console.log('3. Smart contract gets: Unix timestamp of custody_end');

    // Test calculation with sample data
    const testCustodyPeriod = 30; // days
    const testCreatedAt = new Date();
    const testCustodyEnd = new Date(testCreatedAt.getTime() + (testCustodyPeriod * 24 * 60 * 60 * 1000));
    
    console.log('\n🧪 Test Calculation:');
    console.log(`Test created at: ${testCreatedAt.toISOString()}`);
    console.log(`Test custody period: ${testCustodyPeriod} days`);
    console.log(`Test custody end: ${testCustodyEnd.toISOString()}`);
    console.log(`Test Unix timestamp: ${Math.floor(testCustodyEnd.getTime() / 1000)}`);

  } catch (error) {
    console.error('❌ Error debugging custody deadlines:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
}

// Run the script
debugCustodyDeadlines();
