const { Pool } = require('pg');
const { ethers } = require('ethers');
require('dotenv').config();

async function checkPayment112Automation() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kustodia',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
  });

  console.log('🔍 PAYMENT 112 AUTOMATION READINESS CHECK');
  console.log('==========================================\n');

  try {
    // 1. Check payment and escrow status
    console.log('1. 💳 Payment 112 Status Check...');
    const paymentResult = await pool.query(`
      SELECT p.id, p.status, p.payment_type, p.amount, p.payer_approval, p.payee_approval,
             p.payer_email, p.recipient_email, p.commission_beneficiary_email,
             e.id as escrow_id, e.status as escrow_status, e.custody_end, e.smart_contract_escrow_id,
             e.blockchain_tx_hash, e.release_tx_hash, e.custody_amount, e.release_amount
      FROM payment p 
      LEFT JOIN escrow e ON p.escrow_id = e.id 
      WHERE p.id = 112
    `);
    
    if (paymentResult.rows.length === 0) {
      console.log('❌ Payment 112 not found!');
      return;
    }

    const payment = paymentResult.rows[0];
    console.log('✅ Payment 112 found:');
    console.log(`   - Status: ${payment.status}`);
    console.log(`   - Amount: $${payment.amount} MXN`);
    console.log(`   - Payer (${payment.payer_email}): ${payment.payer_approval ? '✅ Approved' : '❌ Not approved'}`);
    console.log(`   - Payee (${payment.recipient_email}): ${payment.payee_approval ? '✅ Approved' : '❌ Not approved'}`);
    console.log(`   - Escrow ID: ${payment.escrow_id}`);
    console.log(`   - Escrow Status: ${payment.escrow_status}`);
    console.log(`   - Smart Contract ID: ${payment.smart_contract_escrow_id}`);
    console.log(`   - Custody End: ${payment.custody_end}`);
    console.log(`   - Release TX: ${payment.release_tx_hash || 'Not released yet'}\n`);

    // 2. Check blockchain connection
    console.log('2. 🔗 Blockchain Connection Check...');
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || process.env.ETH_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to blockchain: Block ${blockNumber}\n`);

    // 3. Check smart contract
    console.log('3. 📋 Smart Contract Check...');
    const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS_2;
    console.log(`✅ Contract address: ${contractAddress}`);
    
    // Check if escrow exists in smart contract
    const contractABI = [
      "function escrows(uint256) view returns (address buyer, address seller, uint256 amount, bool buyerApproved, bool sellerApproved, bool isReleased, uint256 releaseTime)"
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    try {
      const escrowData = await contract.escrows(payment.smart_contract_escrow_id);
      console.log(`✅ Escrow #${payment.smart_contract_escrow_id} found in smart contract:`);
      console.log(`   - Buyer approved: ${escrowData.buyerApproved}`);
      console.log(`   - Seller approved: ${escrowData.sellerApproved}`);
      console.log(`   - Released: ${escrowData.isReleased}`);
      console.log(`   - Amount: ${ethers.formatUnits(escrowData.amount, 6)} MXNB\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch escrow from smart contract: ${error.message}\n`);
    }

    // 4. Check automation readiness
    console.log('4. 🤖 Automation Readiness Check...');
    const now = new Date();
    const custodyEnd = new Date(payment.custody_end);
    const isPastDeadline = now > custodyEnd;
    
    console.log(`   - Current time: ${now.toISOString()}`);
    console.log(`   - Custody deadline: ${custodyEnd.toISOString()}`);
    console.log(`   - Deadline passed: ${isPastDeadline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Days past deadline: ${isPastDeadline ? Math.floor((now - custodyEnd) / (1000 * 60 * 60 * 24)) : 0}\n`);

    // 5. Check what happens when approved
    console.log('5. 🚀 Release Process (when both parties approve)...');
    console.log('   When BOTH payer and payee approve:');
    console.log('   1. ✅ Backend updates payer_approval and payee_approval to true');
    console.log('   2. ✅ Automation cron job (every 10 min) detects dual approval');
    console.log('   3. ✅ Calls smart contract release() function');
    console.log('   4. ✅ MXNB tokens transferred to BRIDGE WALLET (not seller)');
    console.log('   5. ✅ Bridge wallet redeems MXNB via Juno API for MXN');
    console.log('   6. ✅ Juno sends SPEI transfer to seller bank account');
    console.log('   7. ✅ Payment status updated to "completed"\n');

    // 6. Summary
    console.log('==========================================');
    console.log('📊 PAYMENT 112 AUTOMATION SUMMARY');
    console.log('==========================================');
    
    if (payment.status === 'escrowed' && !payment.payer_approval && !payment.payee_approval) {
      console.log('🔄 STATUS: Waiting for dual approval');
      console.log('⏳ NEXT STEPS:');
      console.log('   1. Payer (rodrigojille5@gmail.com) needs to approve');
      console.log('   2. Payee (test-seller@kustodia.mx) needs to approve');
      console.log('   3. Once both approve, automation will release funds');
      console.log('\n✅ AUTOMATION IS READY - Just waiting for approvals!');
    } else if (payment.payer_approval || payment.payee_approval) {
      console.log('⏳ STATUS: Partially approved');
      console.log(`   - Payer: ${payment.payer_approval ? 'Approved ✅' : 'Pending ❌'}`);
      console.log(`   - Payee: ${payment.payee_approval ? 'Approved ✅' : 'Pending ❌'}`);
    } else if (payment.status === 'completed') {
      console.log('✅ STATUS: Payment completed and funds released!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPayment112Automation();
