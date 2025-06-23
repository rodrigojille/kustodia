require('dotenv').config();
const axios = require('axios');

async function testPayment81API() {
  console.log('🔍 TESTING PAYMENT 81 API ENDPOINT');
  console.log('==================================');
  
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
  const url = `${API_BASE_URL}/api/payment/81`;
  
  try {
    console.log(`Making request to: ${url}`);
    
    const response = await axios.get(url);
    const data = response.data;
    
    console.log('✅ API Response received');
    console.log('');
    
    // Extract relevant payment data
    const payment = data.payment;
    
    console.log('📊 PAYMENT DATA:');
    console.log(`ID: ${payment.id}`);
    console.log(`Status: ${payment.status}`);
    console.log(`Amount: $${payment.amount} ${payment.currency}`);
    console.log(`Recipient: ${payment.recipient_email}`);
    console.log('');
    
    if (payment.escrow) {
      console.log('🏦 ESCROW DATA:');
      console.log(`Escrow ID: ${payment.escrow.id}`);
      console.log(`Status: ${payment.escrow.status}`);
      console.log(`Custody Percent: ${payment.escrow.custody_percent}%`);
      console.log(`Custody Amount: $${payment.escrow.custody_amount} MXNB`);
      console.log(`Release Amount: $${payment.escrow.release_amount || 0} MXNB`);
      
      const custodyAmount = parseFloat(payment.escrow.custody_amount);
      const releaseAmount = parseFloat(payment.escrow.release_amount || 0);
      const montoPorPagar = custodyAmount - releaseAmount;
      
      console.log('');
      console.log('🧮 CALCULATED VALUES:');
      console.log(`Custody Amount: ${custodyAmount}`);
      console.log(`Release Amount: ${releaseAmount}`);
      console.log(`Monto Por Pagar: ${montoPorPagar}`);
      
      if (montoPorPagar === 0) {
        console.log('🎉 SUCCESS: Monto por pagar = $0.00!');
      } else {
        console.log(`⚠️ Issue: Monto por pagar = $${montoPorPagar} (should be $0.00)`);
      }
    } else {
      console.log('⚠️ No escrow data found');
    }
    
    console.log('');
    console.log('📋 RECENT EVENTS:');
    if (payment.events && payment.events.length > 0) {
      payment.events.slice(-3).forEach((event, index) => {
        console.log(`${index + 1}. ${event.type}: ${event.description || 'Sin descripción'}`);
      });
    }
    
    return {
      success: true,
      paymentId: payment.id,
      paymentStatus: payment.status,
      escrowStatus: payment.escrow?.status,
      custodyAmount: payment.escrow?.custody_amount,
      releaseAmount: payment.escrow?.release_amount,
      montoPorPagar: payment.escrow ? 
        (parseFloat(payment.escrow.custody_amount) - parseFloat(payment.escrow.release_amount || 0)) : 
        null
    };
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

testPayment81API();
