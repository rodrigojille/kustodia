const http = require('http');

function testAPI() {
  console.log('🔍 TESTING API ENDPOINT DIRECTLY');
  console.log('================================');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/payment/81',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const payment = response.payment;
        
        console.log('✅ API Response received');
        console.log('');
        
        console.log('📊 PAYMENT DATA:');
        console.log(`ID: ${payment.id}`);
        console.log(`Status: ${payment.status}`);
        console.log(`Amount: $${payment.amount} ${payment.currency}`);
        console.log('');
        
        if (payment.escrow) {
          console.log('🏦 ESCROW DATA FROM API:');
          console.log(`Custody Amount: ${payment.escrow.custody_amount}`);
          console.log(`Release Amount: ${payment.escrow.release_amount}`);
          console.log(`Status: ${payment.escrow.status}`);
          
          const montoPorPagar = parseFloat(payment.escrow.custody_amount) - parseFloat(payment.escrow.release_amount || 0);
          console.log(`Calculated Monto Por Pagar: ${montoPorPagar}`);
          
          if (montoPorPagar === 0) {
            console.log('🎉 API SHOWS CORRECT VALUES: Monto Por Pagar = 0');
          } else {
            console.log(`❌ API SHOWS WRONG VALUES: Monto Por Pagar = ${montoPorPagar}`);
          }
        } else {
          console.log('⚠️ No escrow data in API response');
        }
        
        console.log('');
        console.log('📋 RECENT EVENTS FROM API:');
        if (payment.events && payment.events.length > 0) {
          payment.events.slice(-3).forEach((event, index) => {
            console.log(`${index + 1}. ${event.type}: ${event.description || 'No description'}`);
          });
        }
        
      } catch (error) {
        console.error('❌ Error parsing API response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

testAPI();
