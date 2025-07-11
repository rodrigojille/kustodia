import AppDataSource from "../src/ormconfig";
import { Payment } from "../src/entity/Payment";
import { User } from "../src/entity/User";

/**
 * 🚨 CRITICAL FIX: Populate missing payout_juno_bank_account_id on Payment records
 * 
 * Issue: Payment automation is looking for payout_juno_bank_account_id on Payment table
 * but we only stored juno_bank_account_id on User table
 */

async function fixMissingJunoUUIDs() {
  console.log("🔧 Starting fix for missing Juno UUIDs on Payment records...");
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    // Find all payments missing payout_juno_bank_account_id
    const paymentsNeedingFix = await AppDataSource.getRepository(Payment)
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.user", "user")
      .where("payment.payout_juno_bank_account_id IS NULL")
      .andWhere("payment.status IN ('funded', 'processing')")
      .andWhere("user.juno_bank_account_id IS NOT NULL")
      .getMany();

    console.log(`🔍 Found ${paymentsNeedingFix.length} payments needing Juno UUID fix`);

    let fixedCount = 0;
    for (const payment of paymentsNeedingFix) {
      if (payment.user?.juno_bank_account_id) {
        console.log(`🔧 Fixing Payment ${payment.id}: Adding UUID ${payment.user.juno_bank_account_id}`);
        
        // Copy Juno UUID from User to Payment
        payment.payout_juno_bank_account_id = payment.user.juno_bank_account_id;
        await AppDataSource.getRepository(Payment).save(payment);
        
        fixedCount++;
      }
    }

    console.log(`✅ Fixed ${fixedCount} payments with missing Juno UUIDs`);
    
    // Verify the fix
    const stillMissing = await AppDataSource.getRepository(Payment)
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.user", "user")  
      .where("payment.payout_juno_bank_account_id IS NULL")
      .andWhere("payment.status IN ('funded', 'processing')")
      .getMany();
      
    console.log(`🔍 Verification: ${stillMissing.length} payments still missing UUIDs after fix`);
    
    if (stillMissing.length > 0) {
      console.log("⚠️ Remaining payments without UUIDs:");
      for (const payment of stillMissing) {
        console.log(`  - Payment ${payment.id}: User ${payment.user?.id} has UUID: ${payment.user?.juno_bank_account_id || 'NO'}`);
      }
    }

  } catch (error) {
    console.error("❌ Error fixing Juno UUIDs:", error);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Database connection closed");
  }
}

// Run the fix
fixMissingJunoUUIDs().catch(console.error);
