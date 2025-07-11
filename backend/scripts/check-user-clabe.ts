import AppDataSource from '../src/ormconfig';
import { User } from '../src/entity/User';

async function checkUserClabe() {
  try {
    console.log('🔍 Checking User 2 CLABE details...');
    
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Get User 2 details
    const user = await AppDataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id: 2 })
      .getOne();

    if (!user) {
      console.log('❌ User 2 not found');
      return;
    }

    console.log('\n--- User 2 Details ---');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Full Name: ${user.full_name}`);
    console.log(`🏦 Payout CLABE: ${user.payout_clabe || 'NULL'}`);
    console.log(`🆔 Juno Bank Account ID: ${user.juno_bank_account_id || 'NULL'}`);
    console.log(`📅 Created: ${user.created_at}`);
    console.log(`📅 Updated: ${user.updated_at}`);

    // If user has payout_clabe but no juno_bank_account_id, we need to register with Juno
    if (user.payout_clabe && !user.juno_bank_account_id) {
      console.log('\n🚨 ISSUE FOUND: User has payout_clabe but missing juno_bank_account_id');
      console.log('✅ SOLUTION: Need to register this CLABE with Juno API to get UUID');
    } else if (!user.payout_clabe && !user.juno_bank_account_id) {
      console.log('\n🚨 ISSUE FOUND: User has no payout_clabe configured');
      console.log('✅ SOLUTION: User needs to set up their payout CLABE first');
    } else if (user.payout_clabe && user.juno_bank_account_id) {
      console.log('\n✅ User configuration looks correct');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

checkUserClabe();
