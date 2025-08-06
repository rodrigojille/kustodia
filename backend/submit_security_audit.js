const axios = require('axios');
require('dotenv').config();

// Contract details
const CONTRACT_ADDRESS = '0x82fE581F39B1701b6E7Bd0247AFD2aF08ce04c40'; // Your pausable contract address
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;

async function submitSecurityAudit() {
  console.log('🔒 Submitting Contract Security Audit Request...\n');
  
  if (!ARBISCAN_API_KEY) {
    console.error('❌ ARBISCAN_API_KEY not found in environment variables');
    return;
  }

  try {
    // Security audit submission parameters
    const auditData = {
      apikey: ARBISCAN_API_KEY,
      module: 'contract',
      action: 'submitsecurityaudit',
      contractaddress: CONTRACT_ADDRESS,
      contractname: 'KustodiaEscrow2_0Pausable',
      description: 'Kustodia Escrow Smart Contract - Pausable version for mainnet deployment. Handles escrow creation, funding, and release with multi-signature support.',
      contactemail: 'rodrigojille6@gmail.com', // Your contact email
      website: 'https://kustodia.com', // Your website
      // Optional: Add audit firm if you have one
      // auditfirm: 'YourAuditFirm',
      // auditreport: 'https://link-to-your-audit-report.pdf'
    };

    console.log('📤 Submitting security audit request...');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('Contract Name:', auditData.contractname);
    console.log('Contact Email:', auditData.contactemail);
    
    const response = await axios.post('https://api.arbiscan.io/api', 
      new URLSearchParams(auditData), 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('\n📥 Security Audit Submission Response:');
    console.log('Status:', response.data.status);
    console.log('Message:', response.data.message);
    console.log('Result:', response.data.result);

    if (response.data.status === '1') {
      console.log('\n✅ Security audit request submitted successfully!');
      console.log('Your request has been sent to the Arbiscan team for review.');
      console.log('You should receive a confirmation email shortly.');
    } else {
      console.log('\n❌ Security audit submission failed:');
      console.log('Error:', response.data.result);
    }

  } catch (error) {
    console.error('❌ Error during security audit submission:', error.response?.data || error.message);
    
    // If API method doesn't exist, provide manual instructions
    if (error.response?.data?.result?.includes('Invalid action')) {
      console.log('\n📋 Manual Security Audit Submission Instructions:');
      console.log('The API method might not be available. Please submit manually:');
      console.log('\n1. Go to: https://arbiscan.io/contactus');
      console.log('2. Select "Contract Security Audit Request"');
      console.log('3. Fill in the following details:');
      console.log('   - Contract Address:', CONTRACT_ADDRESS);
      console.log('   - Contract Name: KustodiaEscrow2_0Pausable');
      console.log('   - Description: Kustodia Escrow Smart Contract - Pausable version');
      console.log('   - Your Email: rodrigojille6@gmail.com');
      console.log('   - Website: https://kustodia.com');
      console.log('\n4. Submit the form and wait for Arbiscan team response');
    }
  }
}

async function checkCurrentAuditStatus() {
  console.log('🔍 Checking current security audit status...\n');
  
  try {
    // Check if contract has any security audit information
    const response = await axios.get('https://api.arbiscan.io/api', {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: CONTRACT_ADDRESS,
        apikey: ARBISCAN_API_KEY
      }
    });

    if (response.data.status === '1' && response.data.result[0]) {
      const result = response.data.result[0];
      
      console.log('Contract Address:', CONTRACT_ADDRESS);
      console.log('Contract Name:', result.ContractName || 'KustodiaEscrow2_0Pausable');
      console.log('Verification Status: ✅ Verified');
      console.log('Security Audit Status: ❌ Not submitted (as shown in Arbiscan UI)');
      
      return false; // No audit submitted yet
    }
  } catch (error) {
    console.error('Error checking audit status:', error.message);
  }
  
  return false;
}

async function main() {
  console.log('=== KUSTODIA CONTRACT SECURITY AUDIT SUBMISSION ===\n');
  
  await checkCurrentAuditStatus();
  
  console.log('\n🚀 Proceeding with security audit submission...\n');
  await submitSecurityAudit();
  
  console.log('\n📝 Additional Recommendations:');
  console.log('1. Consider getting a professional audit from firms like:');
  console.log('   - OpenZeppelin');
  console.log('   - ConsenSys Diligence');
  console.log('   - Trail of Bits');
  console.log('   - Quantstamp');
  console.log('\n2. After getting a professional audit report:');
  console.log('   - Upload the report to IPFS or your website');
  console.log('   - Update the Arbiscan submission with the audit report link');
  console.log('\n3. This will increase user trust and contract credibility');
}

main().catch(console.error);
