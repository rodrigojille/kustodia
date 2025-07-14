const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { User } = require('./dist/entity/User');
const { createJunoClabe } = require('./dist/services/junoService');

async function createNuevoFlujoPayment() {
  try {
    console.log('🔄 Creating nuevo_flujo Payment 112...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const paymentRepo = AppDataSource.getRepository(Payment);
    const escrowRepo = AppDataSource.getRepository(Escrow);
    const userRepo = AppDataSource.getRepository(User);
    
    // Check if Payment 112 already exists
    const existingPayment = await paymentRepo.findOne({ where: { id: 112 } });
    if (existingPayment) {
      console.log('⚠️  Payment 112 already exists, skipping creation');
      return;
    }
    
    // Get users (same as Payment 111 for consistency)
    const payer = await userRepo.findOne({ where: { id: 1 } }); // rodrigojille6@gmail.com
    const seller = await userRepo.findOne({ where: { id: 2 } }); // test-seller@kustodia.mx
    
    if (!payer || !seller) {
      console.error('❌ Required users not found');
      return;
    }
    
    console.log(`👤 Payer: ${payer.email}`);
    console.log(`👤 Seller: ${seller.email}`);
    
    // Generate valid CLABE for this payment
    console.log('🏦 Generating valid CLABE...');
    const depositClabe = await createJunoClabe();
    console.log(`📋 Generated CLABE: ${depositClabe}`);
    
    // Create escrow first
    const escrow = escrowRepo.create({
      custody_percent: 100, // 100% custody for nuevo_flujo
      custody_amount: 2500.00, // 2500 MXN
      release_amount: 0, // No immediate release
      status: 'pending',
      dispute_status: 'none',
      custody_end: null // Will be set after creation
    });
    
    const savedEscrow = await escrowRepo.save(escrow);
    console.log(`✅ Escrow ${savedEscrow.id} created`);
    
    // Set custody end to 7 days from creation (for nuevo_flujo, this is just a fallback)
    const custodyPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
    savedEscrow.custody_end = new Date(savedEscrow.created_at.getTime() + custodyPeriod * 1000);
    await escrowRepo.save(savedEscrow);
    
    // Create the payment
    const payment = paymentRepo.create({
      user: payer,
      seller: seller,
      recipient_email: seller.email,
      payer_email: payer.email, // Set payer email for nuevo_flujo
      amount: 2500.00,
      currency: 'MXN',
      description: 'Freelance Web Development - Nuevo Flujo Test',
      deposit_clabe: depositClabe,
      payout_clabe: seller.payout_clabe,
      payout_juno_bank_account_id: seller.juno_bank_account_id,
      status: 'pending',
      payment_type: 'nuevo_flujo', // 🔥 KEY: Set as nuevo_flujo
      vertical_type: 'freelance', // 🎯 Set vertical type
      release_conditions: 'Upon completion of website development and client approval', // 📝 Custom conditions
      payer_approval: false, // Start with no approvals
      payee_approval: false,
      escrow: savedEscrow
    });
    
    const savedPayment = await paymentRepo.save(payment);
    
    // Update escrow with payment reference
    savedEscrow.payment_id = savedPayment.id;
    await escrowRepo.save(savedEscrow);
    
    console.log('🎉 Nuevo Flujo Payment 112 created successfully!');
    console.log('📊 Payment Details:');
    console.log(`   - ID: ${savedPayment.id}`);
    console.log(`   - Type: ${savedPayment.payment_type}`);
    console.log(`   - Vertical: ${savedPayment.vertical_type}`);
    console.log(`   - Amount: ${savedPayment.amount} MXN`);
    console.log(`   - CLABE: ${savedPayment.deposit_clabe}`);
    console.log(`   - Payer: ${savedPayment.payer_email}`);
    console.log(`   - Payee: ${savedPayment.recipient_email}`);
    console.log(`   - Release Conditions: ${savedPayment.release_conditions}`);
    console.log(`   - Escrow ID: ${savedEscrow.id}`);
    console.log(`   - Custody: ${savedEscrow.custody_percent}% (${savedEscrow.custody_amount} MXN)`);
    
    console.log('\n🔄 Next Steps:');
    console.log('1. Run mock deposit to fund the payment');
    console.log('2. Test payer approval: POST /api/payments/112/approve/payer');
    console.log('3. Test payee approval: POST /api/payments/112/approve/payee');
    console.log('4. Verify dual approval triggers automatic release');
    
  } catch (error) {
    console.error('❌ Error creating nuevo_flujo payment:', error.message);
    console.error('Full error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

createNuevoFlujoPayment();
