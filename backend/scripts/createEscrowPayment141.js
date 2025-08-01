require('dotenv').config();
const axios = require('axios');

async function createEscrowForPayment141() {
  try {
    console.log('🚀 Starting direct escrow creation for Payment 141...');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }

    // Get Payment 141
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 141 },
      relations: ['escrow', 'user', 'seller']
    });

    if (!payment) {
      throw new Error('Payment 141 not found');
    }

    console.log(`📋 Payment 141 Details:`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Buyer: ${payment.user.email}`);
    console.log(`   Seller: ${payment.seller.email}`);

    // Get escrow configuration
    const escrow = payment.escrow;
    if (!escrow) {
      throw new Error('No escrow configuration found for Payment 141');
    }

    console.log(`📋 Escrow Details:`);
    console.log(`   Custody Amount: ${escrow.custody_amount} ${payment.currency}`);
    console.log(`   Custody Percent: ${escrow.custody_percent}%`);
    console.log(`   Status: ${escrow.status}`);
    console.log(`   Smart Contract ID: ${escrow.smart_contract_escrow_id || 'NOT CREATED'}`);

    // Check if escrow already exists
    if (escrow.smart_contract_escrow_id) {
      console.log('⚠️  Escrow already has a smart contract ID. Skipping creation.');
      return;
    }

    // Create the escrow
    console.log('🔄 Creating escrow on smart contract...');
    
    const escrowResult = await createEscrow(
      escrow.custody_amount,
      payment.currency,
      escrow.custody_end,
      payment.id
    );

    console.log('✅ Escrow created successfully!');
    console.log(`   Smart Contract ID: ${escrowResult.escrowId}`);
    console.log(`   Transaction Hash: ${escrowResult.transactionHash}`);

    // Update escrow record
    await AppDataSource.getRepository(Escrow).update(escrow.id, {
      smart_contract_escrow_id: escrowResult.escrowId,
      status: 'active'
    });

    // Update payment status
    await AppDataSource.getRepository(Payment).update(payment.id, {
      status: 'in_custody'
    });

    // Log success event
    await AppDataSource.getRepository(PaymentEvent).save({
      payment: payment,
      type: 'escrow_created',
      description: `Escrow created successfully with ID ${escrowResult.escrowId}. Transaction: ${escrowResult.transactionHash}`,
      is_automatic: false
    });

    console.log('🎉 Payment 141 escrow creation completed successfully!');
    console.log(`   Payment Status: in_custody`);
    console.log(`   Escrow Status: active`);
    console.log(`   Smart Contract ID: ${escrowResult.escrowId}`);

  } catch (error) {
    console.error('❌ Escrow creation failed:', error.message);
    
    // Log error event
    try {
      const payment = await AppDataSource.getRepository(Payment).findOne({ where: { id: 141 } });
      if (payment) {
        await AppDataSource.getRepository(PaymentEvent).save({
          payment: payment,
          type: 'escrow_creation_error',
          description: `Direct escrow creation failed: ${error.message}`,
          is_automatic: false
        });
      }
    } catch (logError) {
      console.error('Failed to log error event:', logError.message);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
createEscrowForPayment141();
