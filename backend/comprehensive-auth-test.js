require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function comprehensiveAuthTest() {
  console.log('🔍 COMPREHENSIVE AUTHENTICATION & USER DATA TEST');
  console.log('================================================');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');
    
    console.log('\n📋 STEP 1: USER DATA IN DATABASE');
    console.log('================================');
    
    const userResult = await AppDataSource.query(`
      SELECT id, email, role, kyc_status, wallet_address, payout_clabe, 
             mxnb_balance, deposit_clabe, created_at
      FROM "user" 
      WHERE email = $1
    `, ['rodrigojille6@gmail.com']);
    
    if (!userResult || userResult.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    const user = userResult[0];
    console.log('✅ User found in database:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - KYC Status:', user.kyc_status);
    console.log('  - Wallet Address:', user.wallet_address);
    console.log('  - Payout CLABE:', user.payout_clabe);
    console.log('  - MXNB Balance:', user.mxnb_balance);
    console.log('  - Deposit CLABE:', user.deposit_clabe);
    
    console.log('\n🔐 STEP 2: JWT TOKEN ANALYSIS');
    console.log('==============================');
    console.log('To test JWT token, run this in browser console:');
    console.log('');
    console.log('const token = localStorage.getItem("auth_token");');
    console.log('if (token) {');
    console.log('  const payload = JSON.parse(atob(token.split(".")[1]));');
    console.log('  console.log("JWT Payload:", payload);');
    console.log('  console.log("User ID in JWT:", payload.id || payload.userId || payload.sub);');
    console.log('  console.log("Email in JWT:", payload.email);');
    console.log('  console.log("Expires:", new Date(payload.exp * 1000));');
    console.log('} else {');
    console.log('  console.log("❌ No auth_token in localStorage");');
    console.log('}');
    
    console.log('\n🌐 STEP 3: API ENDPOINT TEST');
    console.log('=============================');
    console.log('Test the /api/users/me endpoint:');
    console.log('');
    console.log('// In browser console:');
    console.log('fetch("/api/users/me", {');
    console.log('  headers: {');
    console.log('    "x-auth-token": localStorage.getItem("auth_token")');
    console.log('  }');
    console.log('})');
    console.log('.then(res => {');
    console.log('  console.log("Status:", res.status);');
    console.log('  return res.json();');
    console.log('})');
    console.log('.then(data => console.log("User data:", data))');
    console.log('.catch(err => console.error("Error:", err));');
    
    console.log('\n📊 STEP 4: BACKEND ENDPOINT VERIFICATION');
    console.log('=========================================');
    
    // Check if the user controller exists and is working
    console.log('Backend user controller should be at: /api/users/me');
    console.log('Expected response format:');
    console.log('{');
    console.log('  "user": {');
    console.log('    "id": 2,');
    console.log('    "email": "rodrigojille6@gmail.com",');
    console.log('    "role": "admin",');
    console.log('    "kyc_status": "approved",');
    console.log('    "wallet_address": "0x486B88Ca87533294FB45247387169f081f3102ff",');
    console.log('    "payout_clabe": "002668900881819471",');
    console.log('    "mxnb_balance": "0.000000",');
    console.log('    "deposit_clabe": "710969000000351083"');
    console.log('  }');
    console.log('}');
    
    console.log('\n🔧 STEP 5: FRONTEND COMPONENT ANALYSIS');
    console.log('=======================================');
    console.log('Components that should receive user data:');
    console.log('1. Dashboard page (/dashboard) - calls authFetch("users/me")');
    console.log('2. Configuration page (/dashboard/configuracion) - should receive user prop');
    console.log('3. RevolutAccountCards component - receives user prop');
    console.log('4. KYC verification component - checks user.kyc_status');
    console.log('');
    console.log('If any of these are empty, the issue is in:');
    console.log('- JWT token not being sent correctly');
    console.log('- Backend /api/users/me endpoint not working');
    console.log('- Frontend not passing user data to components');
    
    console.log('\n🎯 STEP 6: DIAGNOSTIC CHECKLIST');
    console.log('================================');
    console.log('✅ User exists in database with correct data');
    console.log('❓ JWT token contains correct user ID/email (test in browser)');
    console.log('❓ /api/users/me endpoint returns user data (test in browser)');
    console.log('❓ Frontend components receive user data (check React DevTools)');
    console.log('❓ Environment variables are accessible (test in browser)');
    
    console.log('\n📝 NEXT ACTIONS:');
    console.log('================');
    console.log('1. Run JWT token test in browser console');
    console.log('2. Test /api/users/me endpoint directly');
    console.log('3. Check React DevTools for user state in dashboard');
    console.log('4. Verify authFetch is working correctly');
    console.log('5. Check browser Network tab for failed requests');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await AppDataSource.destroy();
    console.log('\n📦 Database connection closed');
  }
}

comprehensiveAuthTest();
