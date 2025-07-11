const { DataSource } = require('typeorm');
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

// Initialize DataSource
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kustodia',
  synchronize: false,
  logging: true,
  entities: [
    'dist/entity/**/*.js'
  ],
  migrations: ['dist/migration/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
});

async function checkPayment87CustodyEnd() {
  try {
    console.log('🔍 Checking Payment 87 custody end date...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Get Payment 87 with escrow
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['escrow']
    });

    if (!payment) {
      console.log('❌ Payment 87 not found');
      return;
    }

    console.log('\n📊 Payment 87 Details:');
    console.log(`  - Payment ID: ${payment.id}`);
    console.log(`  - Amount: ${payment.amount} ${payment.currency}`);
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - Deposit CLABE: ${payment.deposit_clabe}`);
    console.log(`  - Created: ${payment.created_at}`);
    console.log(`  - Updated: ${payment.updated_at}`);

    if (payment.escrow) {
      console.log('\n🔒 Escrow Details:');
      console.log(`  - Escrow ID: ${payment.escrow.id}`);
      console.log(`  - Smart Contract ID: ${payment.escrow.smart_contract_escrow_id}`);
      console.log(`  - Status: ${payment.escrow.status}`);
      console.log(`  - Custody Percent: ${payment.escrow.custody_percent}%`);
      console.log(`  - Custody Amount: ${payment.escrow.custody_amount} MXNB`);
      console.log(`  - Release Amount: ${payment.escrow.release_amount} MXNB`);
      console.log(`  - Custody End: ${payment.escrow.custody_end}`);
      console.log(`  - Blockchain TX: ${payment.escrow.blockchain_tx_hash}`);
      console.log(`  - Created: ${payment.escrow.created_at}`);
      console.log(`  - Updated: ${payment.escrow.updated_at}`);

      // Check if custody_end is null or valid
      if (!payment.escrow.custody_end) {
        console.log('\n❌ ISSUE DETECTED: custody_end is NULL!');
        console.log('💡 This means automatic release will not work');
        
        // Calculate what custody_end should be based on payment creation + 2 days
        const custodyEndDate = new Date(payment.created_at);
        custodyEndDate.setDate(custodyEndDate.getDate() + 2);
        
        console.log(`\n🔧 RECOMMENDED FIX:`);
        console.log(`  - Set custody_end to: ${custodyEndDate.toISOString()}`);
        console.log(`  - This is payment created_at + 2 days (as shown in UI)`);
      } else {
        console.log(`\n✅ Custody end date is set: ${payment.escrow.custody_end}`);
        
        // Check if it's expired
        const now = new Date();
        const isExpired = payment.escrow.custody_end < now;
        console.log(`  - Is Expired: ${isExpired}`);
        console.log(`  - Current Time: ${now.toISOString()}`);
      }
    } else {
      console.log('\n❌ No escrow found for Payment 87');
    }

    await AppDataSource.destroy();
    console.log('\n🏁 Check complete');

  } catch (error) {
    console.error('❌ Error checking Payment 87:', error.message);
  }
}

checkPayment87CustodyEnd();
