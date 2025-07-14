const { DataSource } = require('typeorm');
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { createJunoClabe } = require('./dist/services/junoService');

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'kustodia_db',
  entities: ['dist/entity/*.js'],
  synchronize: false,
  ssl: false
});

async function createPayment111() {
  try {
    console.log('🚀 Creating Payment 111 with valid Juno CLABE...');
    
    // Initialize database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);

    // Step 1: Create valid CLABE using Juno API
    console.log('📞 Creating valid CLABE via Juno API...');
    const clabeResult = await createJunoClabe();
    console.log('✅ CLABE created:', clabeResult.clabe);

    // Step 2: Create escrow record first
    console.log('🏪 Creating escrow record...');
    const custodyEndDate = new Date();
    custodyEndDate.setDate(custodyEndDate.getDate() + 1); // 1 day custody period

    const escrow = escrowRepo.create({
      custody_percent: 100.0,
      custody_amount: 1500.0, // 1500 MXN custody
      release_amount: 0.0,
      status: 'pending',
      custody_end: custodyEndDate,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedEscrow = await escrowRepo.save(escrow);
    console.log('✅ Escrow created with ID:', savedEscrow.id);

    // Step 3: Create payment record
    console.log('💰 Creating payment record...');
    const payment = paymentRepo.create({
      recipient_email: 'test-seller@kustodia.mx',
      payer_email: 'rodrigojille6@gmail.com',
      amount: 1500.0,
      currency: 'MXN',
      description: 'Test Payment 111 - Automation Testing',
      deposit_clabe: clabeResult.clabe,
      payout_clabe: '002668900881819471', // Test seller CLABE
      payout_juno_bank_account_id: 'f14bdec6-45ba-4e55-8c42-599df650c8cf', // Test seller UUID
      status: 'pending',
      payment_type: 'standard',
      vertical_type: 'marketplace',
      user_id: 2, // Payer user ID
      seller_id: 3, // Seller user ID
      escrow_id: savedEscrow.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const savedPayment = await paymentRepo.save(payment);
    console.log('✅ Payment created with ID:', savedPayment.id);

    // Step 4: Update escrow with payment reference
    savedEscrow.payment_id = savedPayment.id;
    await escrowRepo.save(savedEscrow);

    console.log('🎉 Payment 111 created successfully!');
    console.log('📋 Payment Details:');
    console.log(`   - Payment ID: ${savedPayment.id}`);
    console.log(`   - Amount: ${savedPayment.amount} MXN`);
    console.log(`   - Deposit CLABE: ${savedPayment.deposit_clabe}`);
    console.log(`   - Payout CLABE: ${savedPayment.payout_clabe}`);
    console.log(`   - Status: ${savedPayment.status}`);
    console.log(`   - Escrow ID: ${savedPayment.escrow_id}`);
    console.log(`   - Custody End: ${custodyEndDate.toISOString()}`);

    console.log('');
    console.log('🔄 Next Steps:');
    console.log('1. Simulate deposit to trigger automation');
    console.log('2. Watch automation process the payment');
    console.log('3. Verify escrow creation and funding');

  } catch (error) {
    console.error('❌ Error creating payment:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

createPayment111();
