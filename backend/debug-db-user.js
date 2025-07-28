const { AppDataSource } = require('./src/ormconfig');

async function debugUserDatabase() {
  try {
    console.log('🔍 Debugging User Database...\n');
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    // Import User entity
    const { User } = require('./src/entity/User');
    const userRepo = AppDataSource.getRepository(User);
    
    // Test email formats
    const testEmails = [
      'rodrigo@kustodia.mx',
      'rodrigojille6@gmail.com'
    ];
    
    console.log('1️⃣ Checking existing users...');
    const allUsers = await userRepo.find({
      select: ['id', 'email', 'full_name', 'kyc_status', 'truora_process_id']
    });
    
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, KYC: ${user.kyc_status || 'null'}`);
    });
    
    console.log('\n2️⃣ Testing email mapping...');
    const account_id = 'rodrigo_kustodia_mx';
    let email = account_id;
    
    if (account_id.includes('_')) {
      const parts = account_id.split('_');
      if (parts.length >= 3) {
        email = `${parts[0]}@${parts.slice(1, -1).join('.')}.${parts[parts.length - 1]}`;
      }
    }
    
    console.log(`Account ID: ${account_id}`);
    console.log(`Mapped Email: ${email}`);
    
    console.log('\n3️⃣ Testing user lookup...');
    const user = await userRepo.findOne({ where: { email: email } });
    
    if (user) {
      console.log('✅ User found:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Full Name: ${user.full_name}`);
      console.log(`- KYC Status: ${user.kyc_status || 'null'}`);
      console.log(`- Truora Process ID: ${user.truora_process_id || 'null'}`);
    } else {
      console.log('❌ User not found with email:', email);
    }
    
    console.log('\n4️⃣ Testing update operation...');
    if (user) {
      const updateData = {
        kyc_status: 'verified',
        truora_process_id: 'test_process_id',
        kyc_completed_at: new Date(),
      };
      
      const result = await userRepo.update(
        { email: email },
        updateData
      );
      
      console.log('Update result:', result);
      console.log('Affected rows:', result.affected);
      
      // Verify the update
      const updatedUser = await userRepo.findOne({ where: { email: email } });
      console.log('Updated user KYC status:', updatedUser?.kyc_status);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

debugUserDatabase();
