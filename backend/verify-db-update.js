const { AppDataSource } = require('./src/ormconfig');

async function verifyDatabaseUpdate() {
  try {
    console.log('🔍 Verifying Database Update...\n');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    // Import User entity
    const { User } = require('./src/entity/User');
    const userRepo = AppDataSource.getRepository(User);
    
    // Check the user's current status
    const user = await userRepo.findOne({ 
      where: { email: 'rodrigo@kustodia.mx' },
      select: ['id', 'email', 'kyc_status', 'truora_process_id']
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- KYC Status: ${user.kyc_status}`);
      console.log(`- Truora Process ID: ${user.truora_process_id}`);
      
      if (user.kyc_status === 'verified') {
        console.log('\n🎉 SUCCESS: User KYC status is now "verified"!');
        console.log('✅ User can now perform transactions');
      } else {
        console.log(`\n⚠️  KYC Status is "${user.kyc_status}" (expected "verified")`);
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

verifyDatabaseUpdate();
