require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

const BASE_URL = process.env.PAYMENT_API_BASE_URL || 'http://localhost:4000';

async function checkEscrow4() {
  try {
    console.log('=== CHECKING ESCROW ID 4 ===');
    const escrowUrl = `${BASE_URL}/api/escrows/4`;
    const escrowRes = await axios.get(escrowUrl);
    const escrow = escrowRes.data.escrow;
    
    console.log(`Escrow ID: ${escrow.id}`);
    console.log(`Payment ID: ${escrow.payment_id}`);
    console.log(`Status: ${escrow.status}`);
    console.log(`Amount: ${escrow.amount}`);
    console.log(`Blockchain Status: ${escrow.blockchain_status}`);
    console.log(`Contract Address: ${escrow.contract_address}`);
    console.log(`Release Conditions Met: ${escrow.release_conditions_met}`);
    console.log(`Buyer Approved: ${escrow.buyer_approved}`);
    console.log(`Seller Delivered: ${escrow.seller_delivered}`);
    console.log(`Created: ${escrow.created_at}`);
    console.log(`Updated: ${escrow.updated_at}`);
    
    // Analysis
    console.log('\n=== ESCROW ANALYSIS ===');
    if (escrow.payment_id === 88) {
      console.log('✅ Escrow is linked to Payment 88');
    } else {
      console.log(`⚠️ Escrow is linked to Payment ${escrow.payment_id}, not 88`);
    }
    
    if (escrow.status === 'active' && escrow.release_conditions_met) {
      console.log('🟡 Escrow should be released - conditions are met!');
    } else if (escrow.status === 'released') {
      console.log('✅ Escrow has been released');
    } else {
      console.log(`⏳ Escrow status: ${escrow.status}`);
      console.log(`   - Buyer Approved: ${escrow.buyer_approved}`);
      console.log(`   - Seller Delivered: ${escrow.seller_delivered}`);
      console.log(`   - Conditions Met: ${escrow.release_conditions_met}`);
    }
    
  } catch (err) {
    console.error('Error checking escrow:', err.response?.data || err.message);
  }
}

checkEscrow4();
