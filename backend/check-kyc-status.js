const AppDataSource = require('./dist/ormconfig').default;
const { User } = require('./dist/entity/User');

async function checkUserKycStatus() {
  try {
    console.log('🔍 Checking User KYC Status...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    }
    
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      select: ['id', 'email', 'kyc_status', 'full_name']
    });
    
    console.log('📊 User KYC Status:');
    users.forEach(user => {
      const kycStatus = user.kyc_status || 'null';
      const statusIcon = kycStatus === 'approved' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${user.id}: ${user.email} - KYC: ${kycStatus}`);
    });
    
    // Check if test-seller@kustodia.mx exists and is approved
    const testSeller = users.find(u => u.email === 'test-seller@kustodia.mx');
    if (!testSeller) {
      console.log('\n⚠️  test-seller@kustodia.mx not found!');
      console.log('💡 This is likely the cause of "Datos de usuario inválidos" error');
    } else if (testSeller.kyc_status !== 'approved') {
      console.log(`\n⚠️  test-seller@kustodia.mx KYC status: ${testSeller.kyc_status}`);
      console.log('💡 Recipient must have kyc_status = "approved" to receive payments');
    } else {
      console.log('\n✅ test-seller@kustodia.mx is approved and ready to receive payments');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkUserKycStatus();
