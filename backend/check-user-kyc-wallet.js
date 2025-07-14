require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function checkUserKycAndWallet() {
  console.log('🔍 CHECKING USER KYC & WALLET DATA');
  console.log('==================================');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');
    
    // Query user directly with SQL
    const result = await AppDataSource.query(`
      SELECT id, email, role, kyc_status, wallet_address, payout_clabe, 
             mxnb_balance, deposit_clabe
      FROM "user" 
      WHERE email = $1
    `, ['rodrigojille6@gmail.com']);
    
    if (!result || result.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result[0];
    
    console.log('\n📋 USER DATA:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- KYC Status:', user.kyc_status || 'NULL');
    console.log('- Wallet Address:', user.wallet_address || 'NULL');
    console.log('- Payout CLABE:', user.payout_clabe || 'NULL');
    console.log('- MXNB Balance:', user.mxnb_balance || 'NULL');
    console.log('- Deposit CLABE:', user.deposit_clabe || 'NULL');
    
    console.log('\n🔍 ISSUE ANALYSIS:');
    
    // Check KYC Status
    if (!user.kyc_status || user.kyc_status !== 'approved') {
      console.log('❌ KYC Issue: Status is', user.kyc_status || 'NULL', '(should be "approved")');
    } else {
      console.log('✅ KYC Status: approved');
    }
    
    // Check Wallet Address
    if (!user.wallet_address) {
      console.log('❌ Wallet Issue: No wallet_address set (needed for MXNB balance)');
    } else {
      console.log('✅ Wallet Address: Set');
      console.log('  Address:', user.wallet_address);
    }
    
    // Check environment variables for Web3
    console.log('\n🌐 WEB3 ENVIRONMENT CHECK:');
    console.log('- ARBITRUM_SEPOLIA_RPC_URL:', process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ? '✅ Set' : '❌ Missing');
    console.log('- MXNB_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS ? '✅ Set' : '❌ Missing');
    
    if (process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS) {
      console.log('  Contract:', process.env.NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
    console.log('\n📦 Database connection closed');
  }
}

checkUserKycAndWallet();
