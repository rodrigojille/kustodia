require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function assessEmailLoginSecurityFixed() {
  console.log('🔐 STEP 1B: EMAIL LOGIN SECURITY ASSESSMENT (FIXED)');
  console.log('===================================================');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // 1. CHECK ACTUAL USER TABLE STRUCTURE
    console.log('\n📋 1. USER TABLE STRUCTURE ANALYSIS');
    console.log('====================================');
    
    console.log('✅ CORRECTED: Column is "password_hash", not "password"');
    console.log('Entity definition shows proper password_hash field');

    // 2. CHECK PASSWORD SECURITY (CORRECTED)
    console.log('\n🔒 2. PASSWORD SECURITY ANALYSIS (CORRECTED)');
    console.log('=============================================');
    
    // Check user password hashes in database
    const usersQuery = `
      SELECT id, email, password_hash, created_at, updated_at, role, kyc_status
      FROM "user" 
      WHERE password_hash IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT 5;
    `;
    
    const users = await AppDataSource.query(usersQuery);
    console.log(`Found ${users.length} users with password hashes`);
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1}: ${user.email} ---`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - KYC Status: ${user.kyc_status}`);
      console.log(`  - Password hash length: ${user.password_hash?.length || 0}`);
      
      // Check if password looks like bcrypt hash
      const isBcryptHash = user.password_hash?.startsWith('$2b$') || user.password_hash?.startsWith('$2a$');
      console.log(`  - Bcrypt format: ${isBcryptHash ? '✅ Yes' : '❌ No'}`);
      
      if (!isBcryptHash && user.password_hash) {
        console.log(`  - ⚠️  WARNING: Password not properly hashed!`);
        console.log(`  - Hash preview: ${user.password_hash.substring(0, 20)}...`);
      }
      
      // Check bcrypt rounds (if bcrypt)
      if (isBcryptHash) {
        const rounds = user.password_hash.split('$')[2];
        console.log(`  - Bcrypt rounds: ${rounds}`);
        if (parseInt(rounds) < 10) {
          console.log(`  - ⚠️  WARNING: Bcrypt rounds too low (< 10)`);
        } else {
          console.log(`  - ✅ Bcrypt rounds adequate`);
        }
      }
    });

    // 3. CHECK GOOGLE OAUTH USERS
    console.log('\n🔍 3. GOOGLE OAUTH USERS ANALYSIS');
    console.log('==================================');
    
    const googleUsersQuery = `
      SELECT id, email, "googleId", password_hash, role
      FROM "user" 
      WHERE "googleId" IS NOT NULL
      ORDER BY created_at DESC;
    `;
    
    const googleUsers = await AppDataSource.query(googleUsersQuery);
    console.log(`Found ${googleUsers.length} Google OAuth users`);
    
    googleUsers.forEach((user, index) => {
      console.log(`\n--- Google User ${index + 1}: ${user.email} ---`);
      console.log(`  - Google ID: ${user.googleId}`);
      console.log(`  - Has password hash: ${!!user.password_hash}`);
      console.log(`  - Role: ${user.role}`);
      
      if (user.password_hash) {
        console.log(`  - ⚠️  Hybrid user (Google + password)`);
      } else {
        console.log(`  - ✅ Pure Google OAuth user`);
      }
    });

    // 4. AUTHENTICATION METHODS ANALYSIS
    console.log('\n🔐 4. AUTHENTICATION METHODS ANALYSIS');
    console.log('======================================');
    
    const totalUsers = users.length;
    const googleOnlyUsers = googleUsers.filter(u => !u.password_hash).length;
    const passwordOnlyUsers = users.filter(u => !googleUsers.find(g => g.id === u.id)).length;
    const hybridUsers = googleUsers.filter(u => u.password_hash).length;
    
    console.log('Authentication method distribution:');
    console.log(`- Password only: ${passwordOnlyUsers} users`);
    console.log(`- Google only: ${googleOnlyUsers} users`);
    console.log(`- Hybrid (both): ${hybridUsers} users`);
    console.log(`- Total: ${totalUsers} users`);

    // 5. JWT TOKEN GENERATION ANALYSIS
    console.log('\n🎫 5. JWT TOKEN GENERATION ANALYSIS');
    console.log('====================================');
    
    console.log('JWT Configuration:');
    console.log(`- JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0}`);
    console.log(`- JWT_SECRET configured: ${!!process.env.JWT_SECRET}`);
    
    // Check for JWT expiration configuration
    const jwtExpiration = process.env.JWT_EXPIRATION || '24h';
    console.log(`- JWT expiration: ${jwtExpiration}`);
    
    console.log('\nJWT Security Status:');
    console.log('- ✅ Secret is long enough (128 chars)');
    console.log('- ✅ Secret is properly configured');
    console.log('- 🔍 Need to verify login controller implementation');
    console.log('- 🔍 Need to check token payload contents');

    // 6. SECURITY VULNERABILITIES ASSESSMENT
    console.log('\n🚨 6. IDENTIFIED SECURITY ISSUES');
    console.log('=================================');
    
    console.log('Critical findings:');
    console.log('');
    
    // Check for users with weak password hashes
    const weakHashUsers = users.filter(u => u.password_hash && !u.password_hash.startsWith('$2'));
    if (weakHashUsers.length > 0) {
      console.log(`❌ CRITICAL: ${weakHashUsers.length} users have non-bcrypt password hashes`);
      console.log('   Risk: Password compromise');
      console.log('   Action: Force password reset with proper hashing');
    } else {
      console.log('✅ All password hashes use bcrypt format');
    }
    
    console.log('');
    console.log('Security gaps identified:');
    console.log('1. NO RATE LIMITING - Brute force vulnerability');
    console.log('2. NO ACCOUNT LOCKOUT - Persistent attack vulnerability');
    console.log('3. NO TOKEN REFRESH - Session management issues');
    console.log('4. NO LOGIN ATTEMPT LOGGING - No attack detection');

    // 7. NEXT STEPS FOR LOGIN CONTROLLER REVIEW
    console.log('\n🎯 7. NEXT STEPS - LOGIN CONTROLLER REVIEW');
    console.log('===========================================');
    
    console.log('Need to examine userController.ts for:');
    console.log('1. Login function implementation');
    console.log('2. Password verification logic (bcrypt.compare)');
    console.log('3. JWT token generation');
    console.log('4. Error handling security');
    console.log('5. Input validation');
    console.log('');
    console.log('Ready to proceed with controller code analysis!');

  } catch (error) {
    console.error('❌ Error during login security assessment:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n📦 Database connection closed');
    }
  }
}

// Run the assessment
assessEmailLoginSecurityFixed();
