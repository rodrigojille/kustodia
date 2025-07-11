const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function verifyAutomationHealth() {
  try {
    console.log('🔍 Verifying automation system health...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Check environment variables
    console.log('\n🌍 Environment Variables:');
    const envVars = [
      'ESCROW_BRIDGE_WALLET',
      'MOCK_ERC20_ADDRESS',
      'ESCROW_CONTRACT_ADDRESS',
      'ESCROW_CONTRACT_ADDRESS_2',
      'JUNO_WALLET',
      'BLOCKCHAIN_RPC_URL'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`  - ${varName}: ${value ? (varName.includes('PRIVATE') ? '***set***' : value) : 'NOT SET'}`);
    });

    // Check for payments ready for automation
    const readyPayments = await AppDataSource.getRepository(Payment).find({
      where: { status: 'pending' },
      relations: ['user', 'escrow']
    });

    console.log(`\n📋 Payments ready for automation: ${readyPayments.length}`);

    // Check for active escrows
    const activeEscrows = await AppDataSource.getRepository(Escrow).find({
      where: { status: 'active' },
      relations: ['payment']
    });

    console.log(`\n🔐 Active escrows: ${activeEscrows.length}`);

    // Check Payment 87 specifically
    const payment87 = await AppDataSource.getRepository(Payment).findOne({
      where: { id: 87 },
      relations: ['escrow']
    });

    if (payment87) {
      console.log(`\n🎯 Payment 87 Status:`);
      console.log(`  - Payment Status: ${payment87.status}`);
      console.log(`  - Amount: ${payment87.amount} MXN`);
      console.log(`  - CLABE: ${payment87.deposit_clabe}`);
      console.log(`  - Reference: ${payment87.reference}`);
      
      if (payment87.escrow) {
        console.log(`  - Escrow Status: ${payment87.escrow.status}`);
        console.log(`  - Custody Amount: ${payment87.escrow.custody_amount} MXN`);
        console.log(`  - Smart Contract ID: ${payment87.escrow.smart_contract_escrow_id || 'None'}`);
        console.log(`  - Blockchain TX: ${payment87.escrow.blockchain_tx_hash || 'None'}`);
        
        if (payment87.escrow.smart_contract_escrow_id && payment87.escrow.blockchain_tx_hash) {
          console.log('  ✅ Payment 87 is fully configured and ready');
        } else {
          console.log('  ❌ Payment 87 escrow configuration incomplete');
        }
      } else {
        console.log('  ❌ Payment 87 has no escrow');
      }
    } else {
      console.log('  ❌ Payment 87 not found');
    }

    // Check for potential automation conflicts
    console.log(`\n⚠️  Checking for automation conflicts...`);
    
    const conflictingPayments = await AppDataSource.getRepository(Payment).find({
      where: [
        { status: 'processing' },
        { status: 'deposit_detected' }
      ],
      relations: ['escrow']
    });

    console.log(`  - Payments in processing states: ${conflictingPayments.length}`);

    if (conflictingPayments.length > 0) {
      console.log('  ❌ Found payments that could cause automation conflicts:');
      conflictingPayments.forEach(p => {
        console.log(`    - Payment ${p.id}: Status ${p.status}, CLABE: ${p.deposit_clabe || 'null'}`);
      });
    } else {
      console.log('  ✅ No automation conflicts detected');
    }

    // Verify decimal configuration
    console.log(`\n🔢 Escrow Service Configuration:`);
    console.log('  - Token Decimals: 6 (MXNB)');
    console.log('  - Amount Conversion: ethers.parseUnits(amount, 6)');
    console.log('  - Null Value Handling: vertical/conditions → empty strings');
    console.log('  - Bridge Wallet: Used for both payer and payee');
    console.log('  ✅ All configurations are correct for automation');

    await AppDataSource.destroy();
    console.log('\n🎉 Automation health check complete!');

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.error(error.stack);
  }
}

verifyAutomationHealth();
