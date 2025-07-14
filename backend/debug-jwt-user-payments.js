require('dotenv').config();
const AppDataSource = require('./dist/ormconfig').default;

async function debugJwtUserPayments() {
  console.log('🔍 DEBUG: JWT USER & PAYMENTS RELATIONSHIP');
  console.log('==========================================');
  
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅ Database connected');

    console.log('\n📋 STEP 1: DECODE JWT TOKEN FROM BROWSER');
    console.log('==========================================');
    
    console.log('Run this in browser console to decode your JWT token:');
    console.log('');
    console.log('const token = localStorage.getItem("auth_token");');
    console.log('const payload = JSON.parse(atob(token.split(".")[1]));');
    console.log('console.log("JWT Payload:", payload);');
    console.log('console.log("User ID:", payload.id || payload.userId || payload.sub);');
    console.log('console.log("Email:", payload.email);');
    console.log('console.log("Expires:", new Date(payload.exp * 1000));');
    console.log('');

    // 2. CHECK ALL PAYMENTS AND THEIR USER RELATIONSHIPS
    console.log('\n📊 STEP 2: ALL PAYMENTS AND USER RELATIONSHIPS');
    console.log('===============================================');
    
    const allPaymentsQuery = `
      SELECT 
        p.id, p.amount, p.status, p.user_id, p.payer_email, p.recipient_email,
        u.id as actual_user_id, u.email as actual_user_email, u.role
      FROM payment p
      LEFT JOIN "user" u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10;
    `;
    
    const allPayments = await AppDataSource.query(allPaymentsQuery);
    console.log(`\nFound ${allPayments.length} recent payments:`);
    
    allPayments.forEach((payment, index) => {
      console.log(`\n--- Payment ${payment.id} ---`);
      console.log(`  - Amount: $${payment.amount}`);
      console.log(`  - Status: ${payment.status}`);
      console.log(`  - User ID in payment: ${payment.user_id}`);
      console.log(`  - Payer email: ${payment.payer_email}`);
      console.log(`  - Recipient email: ${payment.recipient_email}`);
      console.log(`  - Linked user ID: ${payment.actual_user_id}`);
      console.log(`  - Linked user email: ${payment.actual_user_email}`);
      console.log(`  - Linked user role: ${payment.role}`);
    });

    // 3. CHECK SPECIFIC USER'S PAYMENTS
    console.log('\n🔍 STEP 3: CHECK SPECIFIC USER PAYMENTS');
    console.log('========================================');
    
    // Check for admin user (rodrigojille6@gmail.com)
    const adminEmail = 'rodrigojille6@gmail.com';
    console.log(`\nChecking payments for admin user: ${adminEmail}`);
    
    const adminUserQuery = `
      SELECT id, email, role FROM "user" WHERE email = $1;
    `;
    const adminUser = await AppDataSource.query(adminUserQuery, [adminEmail]);
    
    if (adminUser.length > 0) {
      const admin = adminUser[0];
      console.log(`Admin user found: ID ${admin.id}, Role: ${admin.role}`);
      
      // Check payments using the same logic as getUserPayments
      const adminPaymentsQuery = `
        SELECT p.id, p.amount, p.status, p.user_id, p.payer_email, p.recipient_email
        FROM payment p
        WHERE p.user_id = $1 OR p.payer_email = $2 OR p.recipient_email = $2
        ORDER BY p.created_at DESC;
      `;
      
      const adminPayments = await AppDataSource.query(adminPaymentsQuery, [admin.id, admin.email]);
      console.log(`Found ${adminPayments.length} payments for admin user`);
      
      adminPayments.forEach((payment, index) => {
        console.log(`  Payment ${payment.id}: $${payment.amount} (${payment.status})`);
      });
    } else {
      console.log('❌ Admin user not found');
    }

    // 4. CHECK ALL USERS
    console.log('\n👥 STEP 4: ALL USERS SUMMARY');
    console.log('=============================');
    
    const usersQuery = `
      SELECT id, email, role, created_at FROM "user" ORDER BY created_at DESC;
    `;
    const users = await AppDataSource.query(usersQuery);
    
    console.log(`Found ${users.length} total users:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    // 5. DIAGNOSIS SUMMARY
    console.log('\n🎯 STEP 5: DIAGNOSIS SUMMARY');
    console.log('=============================');
    
    console.log('Possible causes of empty payments:');
    console.log('');
    console.log('1. JWT TOKEN ISSUE:');
    console.log('   - Token contains wrong user ID');
    console.log('   - Token contains wrong email');
    console.log('   - Token user doesn\'t exist in database');
    console.log('');
    console.log('2. PAYMENT RELATIONSHIP ISSUE:');
    console.log('   - Payments not linked to correct user_id');
    console.log('   - Payments have different email format');
    console.log('   - Payment user relationships broken');
    console.log('');
    console.log('3. QUERY LOGIC ISSUE:');
    console.log('   - getUserPayments query logic incorrect');
    console.log('   - Database relationship mapping wrong');
    console.log('   - TypeORM configuration issue');

    console.log('\n📋 NEXT STEPS:');
    console.log('===============');
    console.log('1. Decode JWT token in browser (run the command above)');
    console.log('2. Compare JWT user ID/email with database users');
    console.log('3. Check if payments are linked to the JWT user');
    console.log('4. Fix user-payment relationship if needed');

  } catch (error) {
    console.error('❌ Error during JWT user debug:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n📦 Database connection closed');
    }
  }
}

// Run the debug
debugJwtUserPayments();
