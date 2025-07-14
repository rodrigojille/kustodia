require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function comprehensiveEndpointAssessment() {
  console.log('🔍 COMPREHENSIVE ENDPOINT ASSESSMENT');
  console.log('=====================================');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    // 1. ANALYZE BACKEND ROUTES
    console.log('\n📋 1. BACKEND ROUTE ANALYSIS');
    console.log('============================');
    
    console.log('\n🔐 AUTHENTICATION ROUTES:');
    console.log('- GET /api/auth/google - Google OAuth initiation');
    console.log('- GET /api/auth/google/callback - Google OAuth callback');
    
    console.log('\n👤 USER ROUTES (/api/users):');
    console.log('- POST /users/register - Register new user');
    console.log('- POST /users/login - User login');
    console.log('- GET /users/me - Get current user profile (🔒 JWT required)');
    console.log('- PATCH /users/me - Update user profile (🔒 JWT required)');
    console.log('- POST /users/verify-recipient - Verify recipient exists (🔒 JWT required)');
    
    console.log('\n💰 PAYMENT ROUTES (/api/payments):');
    console.log('- GET /payments - Get all payments (🔒 JWT required) - ADMIN ONLY?');
    console.log('- GET /payments/user-payments - Get user payments (🔒 JWT required)');
    console.log('- POST /payments/initiate - Initiate payment (🔒 JWT required)');
    console.log('- POST /payments/request - Request payment (🔒 JWT required)');
    console.log('- GET /payments/:id - Get payment by ID');
    console.log('- GET /payments/:id/events - Get payment events');
    
    console.log('\n🛡️ ADMIN ROUTES (/api/admin):');
    console.log('- GET /admin/payments - Get all payments (🔒 JWT required)');
    console.log('- GET /admin/users - Get all users (🔒 JWT required)');
    console.log('- GET /admin/system/overview - System overview (🔒 JWT required)');
    console.log('- GET /admin/system/activity - System activity (🔒 JWT required)');

    // 2. TEST ACTUAL USER DATA
    console.log('\n📊 2. USER DATA ANALYSIS');
    console.log('=========================');
    
    // Check current users and their data completeness
    const usersQuery = `
      SELECT 
        id, email, full_name, role, kyc_status, 
        wallet_address, deposit_clabe, payout_clabe, 
        juno_bank_account_id, mxnb_balance,
        created_at, updated_at
      FROM "user" 
      ORDER BY created_at DESC 
      LIMIT 10;
    `;
    
    const users = await AppDataSource.query(usersQuery);
    console.log(`\n👥 Found ${users.length} recent users:`);
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1}: ${user.email} ---`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Full Name: ${user.full_name || 'NOT SET'}`);
      console.log(`  - Role: ${user.role || 'user'}`);
      console.log(`  - KYC Status: ${user.kyc_status || 'NOT VERIFIED'}`);
      console.log(`  - Wallet Address: ${user.wallet_address || 'NOT SET'}`);
      console.log(`  - Deposit CLABE: ${user.deposit_clabe || 'NOT SET'}`);
      console.log(`  - Payout CLABE: ${user.payout_clabe || 'NOT SET'}`);
      console.log(`  - Juno Bank ID: ${user.juno_bank_account_id || 'NOT SET'}`);
      console.log(`  - MXNB Balance: ${user.mxnb_balance || '0.00'}`);
      console.log(`  - Created: ${user.created_at}`);
      
      // Data completeness score
      const fields = [user.full_name, user.wallet_address, user.deposit_clabe, user.payout_clabe, user.juno_bank_account_id];
      const completeness = fields.filter(f => f && f !== '').length / fields.length * 100;
      console.log(`  - Data Completeness: ${completeness.toFixed(0)}%`);
    });

    // 3. ANALYZE PAYMENT DATA
    console.log('\n💳 3. PAYMENT DATA ANALYSIS');
    console.log('============================');
    
    const paymentsQuery = `
      SELECT 
        p.id, p.amount, p.status, p.payment_type, p.payer_email, p.recipient_email,
        p.created_at, p.user_id, p.escrow_id,
        u.email as user_email, u.role as user_role
      FROM payment p
      LEFT JOIN "user" u ON p.user_id = u.id
      ORDER BY p.created_at DESC 
      LIMIT 20;
    `;
    
    const payments = await AppDataSource.query(paymentsQuery);
    console.log(`\n💰 Found ${payments.length} recent payments:`);
    
    // Group by status
    const statusGroups = {};
    payments.forEach(payment => {
      if (!statusGroups[payment.status]) {
        statusGroups[payment.status] = [];
      }
      statusGroups[payment.status].push(payment);
    });
    
    console.log('\n📊 Payment Status Distribution:');
    Object.keys(statusGroups).forEach(status => {
      const count = statusGroups[status].length;
      const totalAmount = statusGroups[status].reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      console.log(`  - ${status.toUpperCase()}: ${count} payments, $${totalAmount.toFixed(2)} total`);
    });

    // 4. CHECK FRONTEND COMPONENTS ENDPOINT USAGE
    console.log('\n🖥️ 4. FRONTEND ENDPOINT USAGE ANALYSIS');
    console.log('=======================================');
    
    console.log('\n📱 Dashboard Components:');
    console.log('- RevolutStatusCards.tsx: authFetch("payments")');
    console.log('- RevolutAnalytics.tsx: authFetch("payments")');
    console.log('- RevolutAccountCards.tsx: authFetch("users/me")');
    console.log('- FintechDashboardCards.tsx: authFetch("payments")');
    console.log('- PaymentsByStageChart.tsx: authFetch("payments")');
    console.log('- PaymentsByMonthChart.tsx: authFetch("payments")');
    
    console.log('\n🛡️ Admin Dashboard:');
    console.log('- admin/page.tsx: authFetch("/api/admin/payments")');
    console.log('- admin/page.tsx: authFetch("/api/admin/system/overview")');
    console.log('- admin/page.tsx: authFetch("/api/admin/system/activity")');

    // 5. AUTHENTICATION FLOW ANALYSIS
    console.log('\n🔐 5. AUTHENTICATION FLOW ANALYSIS');
    console.log('===================================');
    
    console.log('\n🔄 Authentication Methods:');
    console.log('1. JWT Token via Authorization header: "Bearer <token>"');
    console.log('2. HTTP-only Cookie: "auth_token"');
    console.log('3. localStorage: "auth_token" (development fallback)');
    
    console.log('\n🌐 Proxy Flow:');
    console.log('Frontend -> /api/proxy/[...path] -> Backend');
    console.log('- Development: localStorage token -> custom header -> backend');
    console.log('- Production: HTTP-only cookie -> backend');

    // 6. IDENTIFY POTENTIAL ISSUES
    console.log('\n⚠️ 6. POTENTIAL ISSUES IDENTIFIED');
    console.log('==================================');
    
    console.log('\n🔍 Endpoint Confusion:');
    console.log('- Dashboard components use authFetch("payments")');
    console.log('- This should proxy to /api/payments');
    console.log('- Backend /api/payments might be admin-only');
    console.log('- Backend /api/payments/user-payments is user-specific');
    
    console.log('\n🔒 Permission Issues:');
    console.log('- Some users might not have proper roles');
    console.log('- JWT tokens might be missing required claims');
    console.log('- Backend might not filter payments by user correctly');
    
    console.log('\n📊 Data Issues:');
    const incompleteUsers = users.filter(u => !u.full_name || !u.wallet_address);
    console.log(`- ${incompleteUsers.length}/${users.length} users have incomplete profiles`);
    
    const orphanedPayments = payments.filter(p => !p.user_email);
    console.log(`- ${orphanedPayments.length}/${payments.length} payments have missing user references`);

    // 7. RECOMMENDATIONS
    console.log('\n✅ 7. RECOMMENDATIONS');
    console.log('======================');
    
    console.log('\n🎯 Immediate Actions:');
    console.log('1. Verify which endpoint dashboard components should actually use');
    console.log('2. Check if /api/payments filters by user or returns all payments');
    console.log('3. Test authentication flow with browser dev tools');
    console.log('4. Verify JWT token contents and claims');
    console.log('5. Check backend logs for authentication errors');
    
    console.log('\n🔧 Technical Fixes:');
    console.log('1. Ensure consistent endpoint usage across components');
    console.log('2. Add proper error handling for failed API calls');
    console.log('3. Implement loading states for all data fetching');
    console.log('4. Add defensive programming for undefined data');
    
    console.log('\n🛡️ Security Improvements:');
    console.log('1. Verify user-based data filtering on backend');
    console.log('2. Ensure admin endpoints require admin role');
    console.log('3. Add rate limiting for API endpoints');
    console.log('4. Implement proper CORS headers');

  } catch (error) {
    console.error('❌ Error during assessment:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n📦 Database connection closed');
    }
  }
}

// Run the assessment
comprehensiveEndpointAssessment();
