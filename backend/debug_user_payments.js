const { Client } = require('pg');
require('dotenv').config();

async function debugUserPayments() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔍 Debugging User Payments...\n');

    // Check all users
    const usersResult = await client.query('SELECT id, email, role FROM "user" ORDER BY id');
    console.log('👥 USERS IN DATABASE:');
    usersResult.rows.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Check all payments
    const paymentsResult = await client.query('SELECT id, user_id, amount, status, created_at FROM payment ORDER BY created_at DESC LIMIT 10');
    console.log('\n💰 RECENT PAYMENTS:');
    if (paymentsResult.rows.length === 0) {
      console.log('  ❌ NO PAYMENTS FOUND IN DATABASE');
    } else {
      paymentsResult.rows.forEach(payment => {
        console.log(`  Payment ID: ${payment.id}, User: ${payment.user_id}, Amount: ${payment.amount}, Status: ${payment.status}, Date: ${payment.created_at}`);
      });
    }

    // Check payments for user ID 2 specifically
    const user2PaymentsResult = await client.query('SELECT * FROM payment WHERE user_id = $1', [2]);
    console.log('\n🎯 PAYMENTS FOR USER ID 2:');
    if (user2PaymentsResult.rows.length === 0) {
      console.log('  ❌ NO PAYMENTS FOR USER ID 2');
    } else {
      console.log(`  ✅ Found ${user2PaymentsResult.rows.length} payments for user ID 2`);
      user2PaymentsResult.rows.forEach(payment => {
        console.log(`    - Payment ${payment.id}: $${payment.amount}, Status: ${payment.status}`);
      });
    }

    // Check if there are payments with different user_ids
    const otherUsersPayments = await client.query('SELECT user_id, COUNT(*) as count FROM payment GROUP BY user_id ORDER BY user_id');
    console.log('\n📊 PAYMENTS BY USER:');
    if (otherUsersPayments.rows.length === 0) {
      console.log('  ❌ NO PAYMENTS FOR ANY USER');
    } else {
      otherUsersPayments.rows.forEach(userPayments => {
        console.log(`  User ID ${userPayments.user_id}: ${userPayments.count} payments`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

debugUserPayments();
