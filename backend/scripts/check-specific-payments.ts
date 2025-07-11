import AppDataSource from "../src/ormconfig";
import { Payment } from "../src/entity/Payment";
import { User } from "../src/entity/User";

async function checkSpecificPayments() {
  console.log("🔍 Checking specific payments 85, 87, and 88...");
  
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    // Check payments 85, 87, 88
    const targetPaymentIds = [85, 87, 88];
    
    for (const paymentId of targetPaymentIds) {
      console.log(`\n--- Payment ${paymentId} ---`);
      
      const payment = await AppDataSource.getRepository(Payment)
        .createQueryBuilder("payment")
        .leftJoinAndSelect("payment.user", "user")
        .leftJoinAndSelect("payment.escrow", "escrow")
        .where("payment.id = :id", { id: paymentId })
        .getOne();

      if (!payment) {
        console.log(`❌ Payment ${paymentId} not found`);
        continue;
      }

      console.log(`📊 Payment ${paymentId} Status: ${payment.status}`);
      console.log(`💰 Amount: ${payment.amount} ${payment.currency}`);
      console.log(`📧 Recipient: ${payment.recipient_email}`);
      console.log(`🏦 Payment payout_juno_bank_account_id: ${payment.payout_juno_bank_account_id || 'NULL'}`);
      
      if (payment.user) {
        console.log(`👤 User ${payment.user.id} juno_bank_account_id: ${payment.user.juno_bank_account_id || 'NULL'}`);
        console.log(`📧 User email: ${payment.user.email}`);
      } else {
        console.log(`❌ No user associated with payment ${paymentId}`);
      }

      if (payment.escrow) {
        console.log(`🔒 Escrow ${payment.escrow.id} status: ${payment.escrow.status}`);
      } else {
        console.log(`❌ No escrow associated with payment ${paymentId}`);
      }
    }

    // Now check what statuses we should include in our fix
    console.log("\n🔍 Checking all payments with missing UUIDs (any status)...");
    const paymentsWithMissingUuids = await AppDataSource.getRepository(Payment)
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.user", "user")
      .where("payment.payout_juno_bank_account_id IS NULL")
      .andWhere("user.juno_bank_account_id IS NOT NULL")
      .getMany();

    console.log(`Found ${paymentsWithMissingUuids.length} payments with missing UUIDs:`);
    for (const payment of paymentsWithMissingUuids) {
      console.log(`- Payment ${payment.id}: status=${payment.status}, user_juno_uuid=${payment.user?.juno_bank_account_id}`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await AppDataSource.destroy();
    console.log("🔌 Database connection closed");
  }
}

checkSpecificPayments();
