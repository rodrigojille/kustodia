import AppDataSource from '../src/ormconfig';
import { Payment } from '../src/entity/Payment';
import { User } from '../src/entity/User';

async function debugSellerRelationships() {
  try {
    console.log('🔍 Debugging seller relationships for payments 85, 87, 88...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Check raw payment data using raw SQL
    for (const paymentId of [85, 87, 88]) {
      const result = await AppDataSource.query(
        'SELECT id, recipient_email, user_id, seller_id, payout_juno_bank_account_id FROM payment WHERE id = $1',
        [paymentId]
      );
      
      if (result.length > 0) {
        const payment = result[0];
        console.log(`\n--- Payment ${paymentId} Raw Data ---`);
        console.log(`📧 recipient_email: ${payment.recipient_email}`);
        console.log(`👤 user_id (buyer): ${payment.user_id || 'NULL'}`);
        console.log(`💰 seller_id: ${payment.seller_id || 'NULL'}`);
        console.log(`🆔 payout_juno_bank_account_id: ${payment.payout_juno_bank_account_id || 'NULL'}`);
      }
    }

    // Find the seller user by email
    const sellerUser = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email: 'test-seller@kustodia.mx' })
      .getOne();

    if (sellerUser) {
      console.log(`\n--- Seller User Details ---`);
      console.log(`🆔 User ID: ${sellerUser.id}`);
      console.log(`📧 Email: ${sellerUser.email}`);
      console.log(`👤 Full Name: ${sellerUser.full_name}`);
      console.log(`🏦 Juno UUID: ${sellerUser.juno_bank_account_id || 'NULL'}`);
      
      // Now fix the seller_id for payments with this recipient using raw SQL
      console.log(`\n🔧 Fixing seller_id for payments with recipient ${sellerUser.email}...`);
      
      const result = await AppDataSource.query(
        'UPDATE payment SET seller_id = $1 WHERE recipient_email = $2 AND seller_id IS NULL',
        [sellerUser.id, sellerUser.email]
      );
        
      console.log(`✅ Updated payments with seller_id = ${sellerUser.id}`);
      
      // Now fix payout_juno_bank_account_id
      if (sellerUser.juno_bank_account_id) {
        const uuidResult = await AppDataSource.query(
          'UPDATE payment SET payout_juno_bank_account_id = $1 WHERE recipient_email = $2 AND payout_juno_bank_account_id IS NULL',
          [sellerUser.juno_bank_account_id, sellerUser.email]
        );
          
        console.log(`✅ Updated payments with payout_juno_bank_account_id = ${sellerUser.juno_bank_account_id}`);
      }
      
      // Verify specific payments after fix
      console.log(`\n🔍 Verification - Payments after fix:`);
      for (const paymentId of [85, 87, 88]) {
        const result = await AppDataSource.query(
          `SELECT p.id, p.recipient_email, p.seller_id, p.payout_juno_bank_account_id, 
                  u.email as seller_email, e.status as escrow_status
           FROM payment p 
           LEFT JOIN "user" u ON u.id = p.seller_id
           LEFT JOIN escrow e ON e.id = p.escrow_id
           WHERE p.id = $1`,
          [paymentId]
        );
          
        if (result.length > 0) {
          const payment = result[0];
          console.log(`📋 Payment ${paymentId}:`);
          console.log(`   👤 seller_id: ${payment.seller_id || 'NULL'}`);
          console.log(`   💰 seller_email: ${payment.seller_email || 'NULL'}`);
          console.log(`   🆔 payout_juno_bank_account_id: ${payment.payout_juno_bank_account_id || 'NULL'}`);
          console.log(`   🔒 escrow_status: ${payment.escrow_status || 'N/A'}`);
          console.log(`   ✅ Ready for automation: ${payment.payout_juno_bank_account_id ? 'YES' : 'NO'}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error debugging seller relationships:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

debugSellerRelationships();
