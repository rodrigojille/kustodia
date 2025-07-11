require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function checkEscrowForPayment88() {
  try {
    // First get payment details
    console.log('=== CHECKING PAYMENT 88 DETAILS ===');
    const paymentUrl = `${BASE_URL}/api/payments/88`;
    const paymentRes = await axios.get(paymentUrl);
    const payment = paymentRes.data.payment;
    
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Status: ${payment.status}`);
    console.log(`Amount: ${payment.amount}`);
    console.log(`Escrow ID: ${payment.escrow_id}`);
    console.log(`Created: ${payment.created_at}`);
    console.log(`Updated: ${payment.updated_at}`);
    
    // Now check the escrow details if escrow_id exists
    if (payment.escrow_id) {
      console.log('\n=== CHECKING ESCROW DETAILS ===');
      const escrowUrl = `${BASE_URL}/api/escrows/${payment.escrow_id}`;
      try {
        const escrowRes = await axios.get(escrowUrl);
        const escrow = escrowRes.data.escrow;
        
        console.log(`Escrow ID: ${escrow.id}`);
        console.log(`Status: ${escrow.status}`);
        console.log(`Amount: ${escrow.amount}`);
        console.log(`Blockchain Status: ${escrow.blockchain_status}`);
        console.log(`Contract Address: ${escrow.contract_address}`);
        console.log(`Release Conditions Met: ${escrow.release_conditions_met}`);
        console.log(`Buyer Approved: ${escrow.buyer_approved}`);
        console.log(`Seller Delivered: ${escrow.seller_delivered}`);
        console.log(`Created: ${escrow.created_at}`);
        console.log(`Updated: ${escrow.updated_at}`);
        
        // Check for release eligibility
        console.log('\n=== ESCROW RELEASE ANALYSIS ===');
        if (escrow.status === 'active' && escrow.release_conditions_met) {
          console.log('🟡 Escrow is active and conditions are met - should be released!');
        } else if (escrow.status === 'released') {
          console.log('✅ Escrow has been released');
        } else {
          console.log(`⏳ Escrow status: ${escrow.status}, conditions met: ${escrow.release_conditions_met}`);
        }
        
      } catch (escrowErr) {
        console.log('❌ Could not fetch escrow details:', escrowErr.response?.data || escrowErr.message);
      }
    } else {
      console.log('⚠️ No escrow_id found for this payment');
    }
    
    // Check payment events
    console.log('\n=== CHECKING PAYMENT EVENTS ===');
    try {
      const eventsUrl = `${BASE_URL}/api/payments/${payment.id}/events`;
      const eventsRes = await axios.get(eventsUrl);
      if (eventsRes.data.events && eventsRes.data.events.length > 0) {
        eventsRes.data.events.forEach(event => {
          console.log(`- ${event.created_at}: ${event.event_type} - ${event.description}`);
        });
      } else {
        console.log('No payment events found');
      }
    } catch (eventErr) {
      console.log('Could not fetch payment events:', eventErr.response?.data || eventErr.message);
    }
    
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
  }
}

checkEscrowForPayment88();
