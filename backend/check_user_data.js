const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

// Local database configuration
const localDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: false,
});

async function checkUserData() {
  console.log('🔍 CHECKING USER DATA FOR ID 2\n');
  
  try {
    await localDataSource.initialize();
    
    // Get user data for ID 2 (rodrigojille6@gmail.com)
    const userData = await localDataSource.query(`
      SELECT id, email, full_name, kyc_status, payout_clabe, deposit_clabe, 
             wallet_address, role, email_verified, created_at, updated_at
      FROM "user" 
      WHERE id = 2;
    `);
    
    console.log('📊 USER DATA:');
    console.table(userData);
    
    if (userData.length > 0) {
      const user = userData[0];
      console.log('\n🎯 KEY FIELDS:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Full Name:', user.full_name);
      console.log('- KYC Status:', user.kyc_status);
      console.log('- Payout CLABE:', user.payout_clabe);
      console.log('- Deposit CLABE:', user.deposit_clabe);
      console.log('- Wallet Address:', user.wallet_address);
      console.log('- Role:', user.role);
      console.log('- Email Verified:', user.email_verified);
    }
    
    await localDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserData().catch(console.error);
