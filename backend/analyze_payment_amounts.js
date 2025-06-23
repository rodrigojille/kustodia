require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function analyzePaymentAmounts() {
  console.log('📊 ANALYZING PAYMENT 81 AMOUNTS & STATUS LOGIC');
  console.log('=============================================');
  
  try {
    await client.connect();
    
    // Get payment details
    const paymentQuery = await client.query(`
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.amount_paid,
        p.custody_percentage,
        p.recipient_email,
        e.custody_amount,
        e.status as escrow_status
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    if (paymentQuery.rows.length === 0) {
      throw new Error('Payment 81 not found');
    }
    
    const payment = paymentQuery.rows[0];
    
    console.log('💰 CURRENT PAYMENT AMOUNTS:');
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Status: ${payment.status}`);
    console.log(`Total Amount: $${payment.amount} MXN`);
    console.log(`Amount Paid: $${payment.amount_paid || 0} MXN`);
    console.log(`Custody Percentage: ${payment.custody_percentage}%`);
    console.log(`Custody Amount: $${payment.custody_amount} MXNB`);
    console.log(`Escrow Status: ${payment.escrow_status}`);
    console.log('');
    
    // Calculate what amounts should be
    const totalAmount = parseFloat(payment.amount);
    const custodyPercentage = parseFloat(payment.custody_percentage);
    const custodyAmount = (totalAmount * custodyPercentage) / 100;
    const immediateAmount = totalAmount - custodyAmount;
    
    console.log('🧮 CALCULATED AMOUNTS:');
    console.log(`Total Payment: $${totalAmount} MXN`);
    console.log(`Custody Percentage: ${custodyPercentage}%`);
    console.log(`Custody Amount: $${custodyAmount} MXN`);
    console.log(`Immediate Amount: $${immediateAmount} MXN`);
    console.log('');
    
    // Determine what amount_paid should be based on status
    let expectedAmountPaid = 0;
    let montosPorPagar = 0;
    
    if (payment.status === 'completed') {
      expectedAmountPaid = totalAmount; // 100% paid
      montosPorPagar = 0; // Nothing left to pay
    } else if (payment.status === 'paid') {
      expectedAmountPaid = immediateAmount; // Only immediate amount paid
      montosPorPagar = custodyAmount; // Custody amount still pending
    } else {
      expectedAmountPaid = 0;
      montosPorPagar = totalAmount;
    }
    
    console.log('✅ EXPECTED VALUES:');
    console.log(`Expected Amount Paid: $${expectedAmountPaid} MXN`);
    console.log(`Expected Monto Por Pagar: $${montosPorPagar} MXN`);
    console.log('');
    
    console.log('🔍 ISSUES FOUND:');
    const currentAmountPaid = parseFloat(payment.amount_paid || 0);
    const currentMontoPorPagar = totalAmount - currentAmountPaid;
    
    console.log(`Current Amount Paid: $${currentAmountPaid} MXN`);
    console.log(`Current Monto Por Pagar: $${currentMontoPorPagar} MXN`);
    
    if (currentAmountPaid !== expectedAmountPaid) {
      console.log(`❌ ISSUE: Amount paid should be $${expectedAmountPaid} but is $${currentAmountPaid}`);
    }
    
    if (currentMontoPorPagar !== montosPorPagar) {
      console.log(`❌ ISSUE: Monto por pagar should be $${montosPorPagar} but is $${currentMontoPorPagar}`);
    }
    
    // Check payment events language
    console.log('');
    console.log('📋 CHECKING EVENT LANGUAGES:');
    const eventsQuery = await client.query(`
      SELECT type, description, created_at
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
    `);
    
    const englishEvents = [];
    eventsQuery.rows.forEach(event => {
      if (event.description && event.description.includes('Successfully') || 
          event.description.includes('Payment') || 
          event.description.includes('Escrow funds') ||
          event.type === 'escrow_released' ||
          event.type === 'mxnb_redeemed' ||
          event.type === 'payment_completed') {
        englishEvents.push({
          type: event.type,
          description: event.description,
          created_at: event.created_at
        });
      }
    });
    
    console.log(`Found ${englishEvents.length} events that need Spanish translation:`);
    englishEvents.forEach(event => {
      console.log(`- ${event.type}: ${event.description}`);
    });
    
    return {
      payment,
      expectedAmountPaid,
      expectedMontoPorPagar: montosPorPagar,
      currentAmountPaid,
      currentMontoPorPagar,
      englishEvents
    };
    
  } catch (error) {
    console.error('❌ Error analyzing payment:', error.message);
    return { error: error.message };
  } finally {
    await client.end();
  }
}

analyzePaymentAmounts();
