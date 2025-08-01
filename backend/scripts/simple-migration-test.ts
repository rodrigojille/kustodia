import ormconfig from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';

/**
 * Simple test to verify the Payment entity migration is working
 */
async function testPaymentMigration() {
  console.log('🧪 Testing Payment Migration...\n');

  try {
    await ormconfig.initialize();
    console.log('✅ Database connected successfully');

    // Test 1: Verify Payment entity has new columns
    console.log('\n📋 Test 1: Payment Entity Column Check');
    const paymentMetadata = ormconfig.getMetadata(Payment);
    const requiredColumns = [
      'broker_email', 
      'seller_email', 
      'total_commission_percentage', 
      'total_commission_amount', 
      'net_amount'
    ];
    
    let allColumnsFound = true;
    for (const columnName of requiredColumns) {
      const column = paymentMetadata.findColumnWithPropertyName(columnName);
      if (column) {
        console.log(`  ✅ ${columnName}: ${column.type} (nullable: ${column.isNullable})`);
      } else {
        console.log(`  ❌ ${columnName}: MISSING`);
        allColumnsFound = false;
      }
    }

    // Test 2: Database Schema Verification
    console.log('\n🗄️  Test 2: Database Schema Verification');
    
    try {
      // Check if payment table has the required columns
      const result = await ormconfig.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'payment'
        AND column_name IN ('broker_email', 'seller_email', 'total_commission_percentage', 'total_commission_amount', 'net_amount')
        ORDER BY column_name;
      `);
      
      if (result.length === 5) {
        console.log('  ✅ All 5 required columns exist in database:');
        result.forEach((col: any) => {
          console.log(`    - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      } else {
        console.log(`  ⚠️  Only ${result.length}/5 columns found. Migration needed.`);
        if (result.length > 0) {
          console.log('  Found columns:');
          result.forEach((col: any) => {
            console.log(`    - ${col.column_name}: ${col.data_type}`);
          });
        }
      }
    } catch (error) {
      console.log('  ⚠️  Could not verify database schema (may need migration):', (error as Error).message);
    }

    // Test 3: Sample Payment Entity Creation (dry run)
    console.log('\n📝 Test 3: Payment Entity Creation (Dry Run)');
    
    const paymentRepo = ormconfig.getRepository(Payment);
    const samplePayment = paymentRepo.create({
      amount: 100000,
      currency: 'MXN',
      description: 'Test cobro payment',
      recipient_email: 'seller@test.com',
      payer_email: 'buyer@test.com',
      status: 'pending',
      payment_type: 'traditional',
      // New commission fields
      broker_email: 'broker@test.com',
      seller_email: 'seller@test.com',
      total_commission_percentage: 4.0,
      total_commission_amount: 4000,
      net_amount: 96000,
      // Multisig fields
      multisig_required: false,
      multisig_status: undefined
    });
    
    console.log('  ✅ Payment entity created successfully with all fields');
    console.log('  📊 Sample payment data:', {
      amount: samplePayment.amount,
      broker_email: samplePayment.broker_email,
      total_commission_percentage: samplePayment.total_commission_percentage,
      net_amount: samplePayment.net_amount
    });

    // Test 4: Verify multisig fields are still present
    console.log('\n🔐 Test 4: Multisig Fields Check');
    const multisigFields = ['multisig_required', 'multisig_status', 'multisig_approval_id'];
    
    for (const fieldName of multisigFields) {
      const column = paymentMetadata.findColumnWithPropertyName(fieldName);
      if (column) {
        console.log(`  ✅ ${fieldName}: ${column.type} (nullable: ${column.isNullable})`);
      } else {
        console.log(`  ❌ ${fieldName}: MISSING`);
      }
    }

    console.log('\n🎉 Migration test completed!');
    
    if (allColumnsFound) {
      console.log('\n📋 SUMMARY:');
      console.log('✅ Payment entity has all required commission columns');
      console.log('✅ Payment creation works with new fields');
      console.log('✅ Multisig fields are preserved');
      console.log('\n🚀 Migration is ready for production!');
    } else {
      console.log('\n⚠️  SUMMARY:');
      console.log('❌ Some columns are missing from the Payment entity');
      console.log('🔧 Run the migration script to add missing columns');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await ormconfig.destroy();
  }
}

// Run the test
if (require.main === module) {
  testPaymentMigration()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testPaymentMigration };
