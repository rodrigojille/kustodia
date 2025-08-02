require('dotenv').config();
const { AppDataSource } = require('../dist/ormconfig');
const { EscrowSafetyService } = require('../dist/services/EscrowSafetyService');

async function recoverPayment117() {
  try {
    console.log('🔧 PAYMENT 117 RECOVERY SCRIPT');
    console.log('================================');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const paymentId = '117';
    
    // 1. Validate prerequisites
    console.log('\n1️⃣ VALIDATING PREREQUISITES...');
    const validation = await EscrowSafetyService.validateEscrowPrerequisites(paymentId);
    
    if (!validation.safe) {
      console.log('❌ Validation failed:');
      validation.issues.forEach(issue => console.log(`   - ${issue}`));
      
      if (validation.issues.some(issue => issue.includes('already exists'))) {
        console.log('\n✅ Escrow already exists - checking status...');
        process.exit(0);
      }
      
      console.log('\n⚠️  Proceeding with manual intervention required');
    } else {
      console.log('✅ Prerequisites validated');
    }

    // 2. Attempt recovery
    console.log('\n2️⃣ ATTEMPTING ESCROW RECOVERY...');
    const recoveryResult = await EscrowSafetyService.recoverStuckEscrow(paymentId);
    
    if (recoveryResult.success) {
      console.log('✅ RECOVERY SUCCESSFUL!');
      console.log(`   Escrow ID: ${recoveryResult.escrowId}`);
      console.log(`   Transaction Hash: ${recoveryResult.transactionHash}`);
      console.log(`   Arbiscan: https://sepolia.arbiscan.io/tx/${recoveryResult.transactionHash}`);
    } else {
      console.log('❌ RECOVERY FAILED');
      console.log(`   Error: ${recoveryResult.error}`);
      console.log(`   Action: ${recoveryResult.action}`);
      
      if (recoveryResult.action === 'manual_intervention') {
        console.log('\n🚨 MANUAL INTERVENTION REQUIRED');
        console.log('   Please check:');
        console.log('   - Smart contract connectivity');
        console.log('   - Bridge wallet MXNB balance');
        console.log('   - Environment variables');
        console.log('   - Payment data integrity');
      }
    }

    // 3. Check for other stuck escrows
    console.log('\n3️⃣ CHECKING FOR OTHER STUCK ESCROWS...');
    const stuckCases = await EscrowSafetyService.detectStuckEscrows();
    
    if (stuckCases.length === 0) {
      console.log('✅ No other stuck escrows detected');
    } else {
      console.log(`⚠️  Found ${stuckCases.length} stuck escrow cases:`);
      stuckCases.forEach(stuckCase => {
        console.log(`   Payment ${stuckCase.paymentId}: ${stuckCase.fundAmount} ${stuckCase.currency} - ${stuckCase.status}`);
      });
    }

    console.log('\n🏁 RECOVERY SCRIPT COMPLETED');
    
  } catch (error) {
    console.error('❌ Recovery script failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Run the recovery
recoverPayment117();
