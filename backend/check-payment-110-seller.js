const { DataSource } = require('typeorm');

async function checkPayment110Seller() {
  // Database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '140290',
    database: 'kustodia',
    entities: ['dist/entity/*.js'],
    synchronize: false,
    logging: false
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const paymentRepo = dataSource.getRepository('Payment');
    
    // Get Payment 110 with seller relation
    const payment = await paymentRepo.findOne({ 
      where: { id: 110 },
      relations: ['seller', 'user', 'escrow']
    });
    
    if (!payment) {
      console.log('❌ Payment 110 not found');
      return;
    }

    console.log('\n📊 Payment 110 Details:');
    console.log('Payment ID:', payment.id);
    console.log('Amount:', payment.amount);
    console.log('Status:', payment.status);
    console.log('Payer Email:', payment.payer_email);
    console.log('Recipient Email:', payment.recipient_email);

    console.log('\n👤 Seller Information:');
    if (payment.seller) {
      console.log('Seller ID:', payment.seller.id);
      console.log('Seller Email:', payment.seller.email);
      console.log('Seller Full Name:', payment.seller.full_name);
      console.log('Seller Wallet Address:', payment.seller.wallet_address);
      console.log('Seller KYC Status:', payment.seller.kyc_status);
      console.log('Seller Payout CLABE:', payment.seller.payout_clabe);
      console.log('Seller Juno Bank Account ID:', payment.seller.juno_bank_account_id);
    } else {
      console.log('❌ No seller relation found');
    }

    console.log('\n🏪 Escrow Information:');
    if (payment.escrow) {
      console.log('Escrow ID:', payment.escrow.id);
      console.log('Escrow Status:', payment.escrow.status);
      console.log('Custody Percent:', payment.escrow.custody_percent);
      console.log('Custody End:', payment.escrow.custody_end);
    } else {
      console.log('❌ No escrow relation found');
    }

    console.log('\n🔍 Diagnosis:');
    if (!payment.seller) {
      console.log('❌ ISSUE: Payment has no seller relation');
    } else if (!payment.seller.wallet_address) {
      console.log('❌ ISSUE: Seller has no wallet_address');
      console.log('💡 SOLUTION: Seller needs to set up their wallet address');
    } else {
      console.log('✅ Seller has wallet address:', payment.seller.wallet_address);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkPayment110Seller();
