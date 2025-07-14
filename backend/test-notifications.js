const axios = require('axios');

async function testNotificationCreation() {
  console.log('🔔 Testing Notification Creation...\n');
  
  const baseURL = 'http://localhost:4000/api';
  
  try {
    // 1. Login to get JWT token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/user/login`, {
      email: 'rodrigojille6@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // 2. Check current notifications
    console.log('2. Checking current notifications...');
    const notificationsResponse = await axios.get(`${baseURL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Current notifications count:', notificationsResponse.data.length);
    console.log('Recent notifications:');
    notificationsResponse.data.slice(0, 3).forEach(notif => {
      console.log(`- ${notif.message} (${notif.type}) - ${notif.createdAt}`);
    });
    
    // 3. Create a new payment to trigger notifications
    console.log('\n3. Creating new payment to test notifications...');
    const paymentData = {
      recipient_email: 'test-seller@kustodia.mx',
      amount: 500,
      currency: 'mxn',
      description: 'Test payment for notification verification',
      custody_percent: 100,
      custody_period: 432000 // 5 days
    };
    
    const paymentResponse = await axios.post(`${baseURL}/payments/initiate`, paymentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment created successfully');
    console.log('Payment ID:', paymentResponse.data.payment.id);
    
    // 4. Wait a moment and check for new notifications
    console.log('\n4. Waiting 2 seconds for notifications to be created...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newNotificationsResponse = await axios.get(`${baseURL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('New notifications count:', newNotificationsResponse.data.length);
    
    if (newNotificationsResponse.data.length > notificationsResponse.data.length) {
      console.log('🎉 SUCCESS: New notifications were created!');
      const newNotifications = newNotificationsResponse.data.slice(0, newNotificationsResponse.data.length - notificationsResponse.data.length);
      newNotifications.forEach(notif => {
        console.log(`✅ New: ${notif.message} (${notif.type}) - Payment ID: ${notif.payment_id}`);
      });
    } else {
      console.log('❌ ISSUE: No new notifications were created after payment creation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testNotificationCreation();
