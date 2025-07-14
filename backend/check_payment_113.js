const axios = require('axios');

// Test script to check payment 113 and its escrow data
async function checkPayment113() {
  try {
    console.log('🔍 Checking Payment 113...');
    
    // Direct API call to get payment 113
    const response = await axios.get('http://localhost:4000/api/payments/113', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment 113 data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if it has escrow data
    const payment = response.data.payment;
    if (payment && payment.escrow) {
      console.log('\n🔒 Escrow Information:');
      console.log(`- Escrow ID: ${payment.escrow.id}`);
      console.log(`- Escrow Status: ${payment.escrow.status}`);
      console.log(`- Dispute Status: ${payment.escrow.dispute_status}`);
      console.log(`- Custody End: ${payment.escrow.custody_end}`);
      
      // Check dispute eligibility
      const now = new Date();
      const custodyEnd = payment.escrow.custody_end ? new Date(payment.escrow.custody_end) : null;
      const canRaise = ['funded', 'in_progress', 'en_custodia', 'escrowed'].includes(payment.status) &&
        ['pending', 'active', 'funded'].includes(payment.escrow.status ?? '') &&
        (payment.escrow.dispute_status === 'none' || payment.escrow.dispute_status === 'dismissed') &&
        (!custodyEnd || now < custodyEnd);
      
      // New extended dispute logic
      const hasNoDualApproval = !payment.payer_approval || !payment.payee_approval;
      const custodyExpired = custodyEnd && now > custodyEnd;
  
      const canRaiseExtended = [
        'funded', 'in_progress', 'en_custodia', 'escrowed'
      ].includes(payment.status) &&
        ['pending', 'active', 'funded'].includes(payment.escrow.status ?? '') &&
        (payment.escrow.dispute_status === 'none' || payment.escrow.dispute_status === 'dismissed') &&
        (!custodyEnd || now < custodyEnd || (custodyExpired && hasNoDualApproval));
  
      console.log('⚖️ ORIGINAL Dispute Eligibility:', canRaise ? '✅ CAN DISPUTE' : '❌ CANNOT DISPUTE');
      console.log('⚖️ NEW EXTENDED Dispute Eligibility:', canRaiseExtended ? '✅ CAN DISPUTE' : '❌ CANNOT DISPUTE');
      console.log(`- Payment Status: ${payment.status} (needs: funded, in_progress, en_custodia, escrowed)`);
      console.log(`- Escrow Status: ${payment.escrow.status} (needs: pending, active, funded)`);
      console.log(`- Dispute Status: ${payment.escrow.dispute_status} (needs: none, dismissed)`);
      console.log(`- Custody End: ${payment.escrow.custody_end} (must be future or null)`);
      console.log(`- Payer Approval: ${payment.payer_approval}`);
      console.log(`- Payee Approval: ${payment.payee_approval}`);
      console.log(`- Has No Dual Approval: ${hasNoDualApproval}`);
      console.log(`- Custody Expired: ${custodyExpired}`);
  
      // Check custody expiration notification
      if (custodyExpired && hasNoDualApproval && payment.status !== 'completed') {
        console.log('⚠️ CUSTODY NOTIFICATION: Should show "Custodia expirada" warning');
      } else {
        console.log('ℹ️ CUSTODY NOTIFICATION: No warning needed');
      }
  
    } else {
      console.log('\n❌ No escrow data found for payment 113');
    }
    
  } catch (error) {
    console.error('❌ Error checking payment 113:', error.response?.data || error.message);
  }
}

checkPayment113();
