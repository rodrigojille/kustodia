const AppDataSource = require('./dist/ormconfig').default;
const { Payment } = require('./dist/entity/Payment');
const { Escrow } = require('./dist/entity/Escrow');

async function debugPayment87EscrowParams() {
  try {
    console.log('🔍 Debugging Payment 87 escrow parameters...');
    
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

    console.log('\n📋 PAYMENT 87 DATA:');
    console.log(`  - ID: ${payment.id}`);
    console.log(`  - Amount: ${payment.amount}`);
    console.log(`  - Status: ${payment.status}`);
    console.log(`  - User wallet: ${payment.user?.wallet_address}`);
    console.log(`  - Payout CLABE: ${payment.payout_clabe}`);
    console.log(`  - Deposit CLABE: ${payment.deposit_clabe}`);
    console.log(`  - Release conditions: ${payment.release_conditions}`);
    console.log(`  - Vertical type: ${payment.vertical_type}`);

    // Check escrow data
    if (payment.escrow) {
      console.log('\n🔒 ESCROW DATA:');
      console.log(`  - Escrow ID: ${payment.escrow.id}`);
      console.log(`  - Status: ${payment.escrow.status}`);
      console.log(`  - Custody percent: ${payment.escrow.custody_percent}`);
      console.log(`  - Custody amount: ${payment.escrow.custody_amount}`);
      console.log(`  - Release amount: ${payment.escrow.release_amount}`);
      console.log(`  - Custody end: ${payment.escrow.custody_end}`);
      console.log(`  - Smart contract escrow ID: ${payment.escrow.smart_contract_escrow_id}`);
      console.log(`  - Blockchain TX hash: ${payment.escrow.blockchain_tx_hash}`);

      // Check for undefined values that would cause BigInt errors
      console.log('\n🔍 CHECKING FOR UNDEFINED VALUES:');
      console.log(`  - custody_amount: ${payment.escrow.custody_amount} (type: ${typeof payment.escrow.custody_amount})`);
      console.log(`  - custody_end: ${payment.escrow.custody_end} (type: ${typeof payment.escrow.custody_end})`);
      
      if (payment.escrow.custody_end) {
        const deadline = Math.floor(new Date(payment.escrow.custody_end).getTime() / 1000);
        console.log(`  - custody_end as Unix timestamp: ${deadline}`);
      }

      // Simulate escrow creation parameters
      console.log('\n🔧 SIMULATED ESCROW CREATION PARAMETERS:');
      const params = {
        payer: payment.user?.wallet_address || 'undefined',
        payee: payment.user?.wallet_address || 'undefined', // seller address
        token: process.env.MXNB_TOKEN_ADDRESS || 'undefined',
        amount: payment.escrow.custody_amount ? payment.escrow.custody_amount.toString() : 'undefined',
        deadline: payment.escrow.custody_end ? Math.floor(new Date(payment.escrow.custody_end).getTime() / 1000) : undefined,
        vertical: payment.vertical_type || 'undefined',
        clabe: payment.deposit_clabe || 'undefined',
        conditions: payment.release_conditions || 'undefined'
      };
      
      console.log('Parameters that would be passed to createEscrow:');
      Object.entries(params).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value} (${typeof value})`);
        if (value === undefined || value === 'undefined') {
          console.log(`    ⚠️  UNDEFINED VALUE DETECTED for ${key}`);
        }
      });

    } else {
      console.log('\n❌ No escrow found for Payment 87');
    }

    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error debugging payment:', error.message);
    process.exit(1);
  }
}

debugPayment87EscrowParams();
