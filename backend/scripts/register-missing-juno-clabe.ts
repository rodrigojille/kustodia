import AppDataSource from '../src/ormconfig';
import { User } from '../src/entity/User';
import { registerBankAccount } from '../src/services/junoService';

async function registerMissingJunoClabe() {
  try {
    console.log('🔧 Registering missing Juno CLABE for User 2...');
    
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

    console.log('\n--- User 2 Current State ---');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Full Name: ${user.full_name}`);
    console.log(`🏦 Payout CLABE: ${user.payout_clabe || 'NULL'}`);
    console.log(`🆔 Juno Bank Account ID: ${user.juno_bank_account_id || 'NULL'}`);

    // Check if user has CLABE but no Juno UUID
    if (!user.payout_clabe) {
      console.log('\n❌ User has no payout_clabe - cannot register with Juno');
      return;
    }

    if (user.juno_bank_account_id) {
      console.log('\n✅ User already has Juno UUID - no action needed');
      return;
    }

    // Register CLABE with Juno
    console.log('\n🚀 Registering CLABE with Juno API...');
    try {
      const junoResponse = await registerBankAccount(user.payout_clabe, user.full_name);
      console.log('✅ Juno registration successful:', junoResponse);

      // Update user with Juno UUID
      const junoUuid = junoResponse.id;
      await AppDataSource
        .getRepository(User)
        .update(user.id, { 
          juno_bank_account_id: junoUuid 
        });

      console.log(`✅ Updated User ${user.id} with Juno UUID: ${junoUuid}`);

      // Verify update
      const updatedUser = await AppDataSource
        .getRepository(User)
        .findOne({ where: { id: user.id } });

      console.log('\n--- Updated User 2 State ---');
      console.log(`🆔 Juno Bank Account ID: ${updatedUser?.juno_bank_account_id || 'NULL'}`);

    } catch (junoError: any) {
      console.error('❌ Failed to register CLABE with Juno:', junoError);
      if (junoError.response) {
        console.error('Juno API Response:', junoError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Error in registration process:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

registerMissingJunoClabe();
