import AppDataSource from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';

/**
 * 🚨 CRITICAL FIX: Copy Juno UUIDs from SELLER to Payment.payout_juno_bank_account_id
 * 
 * Issue: Payment automation was looking at payment.user (buyer) instead of payment.seller (recipient)
 * The payout_juno_bank_account_id should come from the seller, not the buyer!
 */
async function fixSellerJunoUUIDs() {
  console.log('🔧 Fixing Payment.payout_juno_bank_account_id from SELLER UUIDs...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Find payments missing payout_juno_bank_account_id where SELLER has Juno UUID
    const paymentsNeedingFix = await AppDataSource.getRepository(Payment)
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'buyer')      // The buyer
      .leftJoinAndSelect('payment.seller', 'seller')   // The recipient/seller  
      .leftJoinAndSelect('payment.escrow', 'escrow')
      .where('payment.payout_juno_bank_account_id IS NULL')
      .andWhere('seller.juno_bank_account_id IS NOT NULL')
      .getMany();

    console.log(`🔍 Found ${paymentsNeedingFix.length} payments needing SELLER UUID fix`);

    let fixedCount = 0;
    for (const payment of paymentsNeedingFix) {
      if (payment.seller?.juno_bank_account_id) {
        console.log(`🔧 Payment ${payment.id}:`);
        console.log(`   👤 Buyer: ${payment.user?.email || 'N/A'} (User ${payment.user?.id})`);
        console.log(`   💰 Seller: ${payment.seller.email} (User ${payment.seller.id})`);
        console.log(`   🆔 Seller Juno UUID: ${payment.seller.juno_bank_account_id}`);
        console.log(`   📊 Status: ${payment.status}, Escrow: ${payment.escrow?.status || 'N/A'}`);
        
        // Copy SELLER's Juno UUID to payment
        payment.payout_juno_bank_account_id = payment.seller.juno_bank_account_id;
        await AppDataSource.getRepository(Payment).save(payment);
        
        console.log(`   ✅ Fixed Payment ${payment.id} with seller's UUID`);
        fixedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} payments with seller Juno UUIDs`);
    
    // Verify specific problematic payments
    console.log('\n🔍 Checking specific payments 85, 87, 88...');
    for (const paymentId of [85, 87, 88]) {
      const payment = await AppDataSource.getRepository(Payment)
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.seller', 'seller')
        .leftJoinAndSelect('payment.escrow', 'escrow')
        .where('payment.id = :id', { id: paymentId })
        .getOne();
        
      if (payment) {
        console.log(`📋 Payment ${paymentId}:`);
        console.log(`   💰 Recipient: ${payment.recipient_email}`);
        console.log(`   🆔 payout_juno_bank_account_id: ${payment.payout_juno_bank_account_id || 'NULL'}`);
        console.log(`   👤 Seller UUID: ${payment.seller?.juno_bank_account_id || 'NULL'}`);
        console.log(`   🔒 Escrow Status: ${payment.escrow?.status || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing seller Juno UUIDs:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

fixSellerJunoUUIDs();
