const { Client } = require('pg');

async function checkCurrentUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '140290',
    database: 'kustodia'
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // Check current user data
    const userQuery = `
      SELECT id, email, wallet_address, role, full_name, created_at
      FROM "user" 
      WHERE email LIKE '%rojll%' OR email LIKE '%rodrigo%' 
      ORDER BY id DESC 
      LIMIT 5;
    `;

    const userResult = await client.query(userQuery);
    
    console.log('\n👤 Current User Data:');
    if (userResult.rows.length > 0) {
      userResult.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. User ${user.id}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.full_name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Wallet: ${user.wallet_address}`);
        console.log(`   Created: ${user.created_at}`);
      });
    } else {
      console.log('   No users found with that email pattern');
    }

    // Check admin addresses from env
    console.log('\n🔐 Multi-Sig Admin Addresses from .env:');
    console.log(`   MULTISIG_ADMIN_1: ${process.env.MULTISIG_ADMIN_1}`);
    console.log(`   MULTISIG_ADMIN_2: ${process.env.MULTISIG_ADMIN_2}`);
    console.log(`   MULTISIG_ADMIN_3: ${process.env.MULTISIG_ADMIN_3}`);
    console.log(`   MULTISIG_EMERGENCY_ADMIN: ${process.env.MULTISIG_EMERGENCY_ADMIN}`);

    // Check if current user wallet matches any admin address
    if (userResult.rows.length > 0) {
      const currentUserWallet = userResult.rows[0].wallet_address;
      const adminAddresses = [
        process.env.MULTISIG_ADMIN_1,
        process.env.MULTISIG_ADMIN_2,
        process.env.MULTISIG_ADMIN_3,
        process.env.MULTISIG_EMERGENCY_ADMIN
      ].filter(Boolean);

      console.log('\n🔍 Admin Access Check:');
      const isAdmin = adminAddresses.includes(currentUserWallet);
      console.log(`   Current user wallet: ${currentUserWallet}`);
      console.log(`   Is admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
      
      if (!isAdmin) {
        console.log('\n💡 Solution Options:');
        console.log('   1. Add current wallet to admin list in .env');
        console.log('   2. Use WalletConnect for admin signing');
        console.log('   3. Create non-admin endpoints for dashboard display');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

// Load environment variables
require('dotenv').config();
checkCurrentUser();
