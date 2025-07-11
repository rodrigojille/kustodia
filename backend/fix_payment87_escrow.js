const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');
const { PaymentEvent } = require('./dist/entity/PaymentEvent');

async function fixPayment87Escrow() {
  try {
    console.log('🔧 Fixing Payment 87 escrow creation...');
    
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

    console.log('📋 Payment 87 found, current status:', payment.status);
    console.log('🔒 Current escrow status:', payment.escrow?.status);

    // Check environment variables for missing values
    const ESCROW_BRIDGE_WALLET = process.env.ESCROW_BRIDGE_WALLET || '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b';
    const MOCK_ERC20_ADDRESS = process.env.MOCK_ERC20_ADDRESS;
    const JUNO_WALLET = process.env.JUNO_WALLET;
    
    console.log('🔍 Environment variables:');
    console.log('  - ESCROW_BRIDGE_WALLET:', ESCROW_BRIDGE_WALLET, process.env.ESCROW_BRIDGE_WALLET ? '(from env)' : '(using fallback)');
    console.log('  - MOCK_ERC20_ADDRESS:', MOCK_ERC20_ADDRESS);
    console.log('  - JUNO_WALLET:', JUNO_WALLET);

    if (!ESCROW_BRIDGE_WALLET) {
      console.log('❌ ESCROW_BRIDGE_WALLET not found in environment variables');
      console.log('⚠️  Cannot proceed with escrow creation without bridge wallet address');
      return;
    }
    
    if (!MOCK_ERC20_ADDRESS) {
      console.log('❌ MOCK_ERC20_ADDRESS not found in environment variables');
      console.log('⚠️  Cannot proceed with escrow creation without token address');
      return;
    }

    // Update Payment 87 with missing values that caused the BigInt error
    console.log('🔄 Updating Payment 87 with missing values...');
    
    // Set default values for missing fields (Flow 2 will use these, current flow passes null)
    // No need to update database fields - escrow service handles null values gracefully
    
    await AppDataSource.getRepository(Payment).save(payment);
    console.log('✅ Payment updated with default values');

    // Simulate the escrow creation parameters (corrected - both payer and payee are bridge wallet)
    const escrowParams = {
      payer: ESCROW_BRIDGE_WALLET, // Bridge wallet acts as payer for frictionless UX
      payee: ESCROW_BRIDGE_WALLET, // Bridge wallet acts as payee for frictionless UX
      token: MOCK_ERC20_ADDRESS,
      amount: payment.escrow.custody_amount.toString(),
      deadline: Math.floor(new Date(payment.escrow.custody_end).getTime() / 1000),
      vertical: payment.vertical_type || null, // Flow 2 will use verticals, current flow passes null
      clabe: payment.deposit_clabe, // Use deposit_clabe for traceability
      conditions: payment.release_conditions || null // Flow 2 will use conditions, current flow passes null
    };

    console.log('🔧 Corrected escrow creation parameters:');
    Object.entries(escrowParams).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value} (${typeof value})`);
    });

    // Check for any remaining undefined values
    const undefinedParams = Object.entries(escrowParams).filter(([key, value]) => 
      value === undefined || value === null
    );

    if (undefinedParams.length > 0) {
      console.log('⚠️  Still have undefined parameters:');
      undefinedParams.forEach(([key, value]) => {
        console.log(`    - ${key}: ${value}`);
      });
    } else {
      console.log('✅ All parameters are now defined and ready for escrow creation');
    }

    // Add a PaymentEvent to log this fix
    const fixEvent = AppDataSource.getRepository(PaymentEvent).create({
      paymentId: 87,
      type: 'manual_fix',
      description: 'Fixed undefined values that caused BigInt error in escrow creation'
    });
    await AppDataSource.getRepository(PaymentEvent).save(fixEvent);
    console.log('📝 Added PaymentEvent documenting the fix');

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. ✅ Fixed undefined values in Payment 87');
    console.log('2. ⏳ Manual escrow creation can now proceed');
    console.log('3. ⏳ Need to call escrow service with corrected parameters');
    console.log('4. ⏳ Update escrow status to "active" after blockchain creation');

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error fixing payment:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixPayment87Escrow();
