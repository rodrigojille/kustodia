const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');
const { createEscrow } = require('./dist/services/escrowService');

async function createPayment87Escrow() {
  try {
    console.log('🚀 Creating Payment 87 escrow on blockchain...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get payment with all relations
    const payment = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['user', 'escrow']
    });

    if (!payment) {
      console.log('❌ Payment 87 not found');
      return;
    }

    if (!payment.escrow) {
      console.log('❌ No escrow found for Payment 87');
      return;
    }

    console.log('📋 Payment 87 details:');
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - Amount: ${payment.amount} MXN`);
    console.log(`  - Escrow Status: ${payment.escrow.status}`);
    console.log(`  - Custody Amount: ${payment.escrow.custody_amount} MXN`);

    // Check if escrow already has smart contract ID
    if (payment.escrow.smart_contract_escrow_id) {
      console.log('⚠️  Escrow already has smart contract ID:', payment.escrow.smart_contract_escrow_id);
      console.log('💡 Use release script if you want to release this escrow');
      return;
    }

    // Environment variables
    const ESCROW_BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    const MOCK_ERC20_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
    
    console.log('🔍 Environment check:');
    console.log(`  - ESCROW_BRIDGE_WALLET: ${ESCROW_BRIDGE_WALLET}`);
    console.log(`  - MOCK_ERC20_ADDRESS: ${MOCK_ERC20_ADDRESS}`);

    if (!MOCK_ERC20_ADDRESS) {
      console.log('❌ MOCK_ERC20_ADDRESS not found in environment variables');
      return;
    }

    // Prepare escrow creation parameters
    const escrowParams = {
      payer: ESCROW_BRIDGE_WALLET,
      payee: ESCROW_BRIDGE_WALLET,
      token: MOCK_ERC20_ADDRESS,
      amount: payment.escrow.custody_amount.toString(),
      deadline: Math.floor(new Date(payment.escrow.custody_end).getTime() / 1000),
      vertical: payment.vertical_type || null,
      clabe: payment.deposit_clabe,
      conditions: payment.release_conditions || null
    };

    console.log('\n🔧 Escrow creation parameters:');
    Object.entries(escrowParams).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value} (${typeof value})`);
    });

    console.log('\n⏳ Creating escrow on blockchain...');
    
    // Log escrow creation attempt
    await AppDataSource.getRepository(PaymentEvent).save({
      paymentId: payment.id,
      type: 'manual_escrow_creation_attempt',
      description: `Manual escrow creation initiated for custody amount: ${payment.escrow.custody_amount} MXN`
    });

    // Call the escrow service
    const result = await createEscrow(escrowParams);
    
    console.log('\n✅ Escrow created successfully!');
    console.log(`  - Escrow ID: ${result.escrowId}`);
    console.log(`  - Transaction Hash: ${result.txHash}`);

    // Update the database
    payment.escrow.smart_contract_escrow_id = result.escrowId;
    payment.escrow.blockchain_tx_hash = result.txHash;
    payment.escrow.status = 'active';
    
    await AppDataSource.getRepository(Escrow).save(payment.escrow);

    // Log successful escrow creation
    await AppDataSource.getRepository(PaymentEvent).save({
      paymentId: payment.id,
      type: 'escrow_created',
      description: `✅ Escrow created successfully - ID: ${result.escrowId}, TX: ${result.txHash}`
    });

    console.log('\n🎯 ESCROW CREATION COMPLETED!');
    console.log('📊 Updated database records:');
    console.log(`  - Escrow Status: ${payment.escrow.status}`);
    console.log(`  - Smart Contract ID: ${payment.escrow.smart_contract_escrow_id}`);
    console.log(`  - Blockchain TX: ${payment.escrow.blockchain_tx_hash}`);
    
    console.log('\n💰 FINANCIAL SUMMARY:');
    console.log(`  - Total Payment: ${payment.amount} MXN`);
    console.log(`  - Released to Seller: ${payment.escrow.release_amount} MXN (already paid)`);
    console.log(`  - Locked in Escrow: ${payment.escrow.custody_amount} MXN ✅`);
    console.log(`  - Escrow Release Date: ${payment.escrow.custody_end}`);

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Escrow creation failed:', error.message);
    console.error(error.stack);
    
    // Log the error
    try {
      await AppDataSource.getRepository(PaymentEvent).save({
        paymentId: 87,
        type: 'manual_escrow_creation_failed',
        description: `❌ Manual escrow creation failed: ${error.message}`
      });
    } catch (logError) {
      console.error('Failed to log error:', logError.message);
    }
    
    process.exit(1);
  }
}

createPayment87Escrow();
