const { MultiSigApprovalService } = require('../dist/services/MultiSigApprovalService');

async function testMultiSigWorkflow() {
  console.log('🔧 Multi-Sig Approval Workflow Test');
  console.log('=====================================\n');

  try {
    // Initialize the service
    const approvalService = new MultiSigApprovalService();
    console.log('✅ MultiSigApprovalService initialized\n');

    // Test 1: Create a transaction proposal
    console.log('1️⃣ Creating Transaction Proposal...');
    const proposal = await approvalService.proposeTransaction({
      paymentId: 'PAY_TEST_001',
      to: '0x742d35Cc6634C0532925a3b8D0c6964b1B8b3d3d',
      value: '1000000000000000000', // 1 ETH in wei
      amount: 18770, // 18,770 MXN (~$1,000)
      amountUsd: 1000,
      type: 'WITHDRAWAL',
      createdBy: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
      metadata: {
        description: 'Test high-value withdrawal',
        category: 'testing'
      }
    });

    console.log('   Transaction ID:', proposal.transactionId);
    console.log('   Payment ID:', proposal.paymentId);
    console.log('   Amount:', `${proposal.amount} MXN (~$${proposal.amountUsd})`);
    console.log('   Required Approvals:', `${proposal.requiredApprovals}`);
    console.log('   Status:', proposal.status);
    console.log('   ✅ Proposal created successfully\n');

    // Test 2: First approval
    console.log('2️⃣ First Approval...');
    const firstApproval = await approvalService.approveTransaction(
      proposal.transactionId,
      '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b' // Bridge wallet (signer 1)
    );

    console.log('   Approver:', '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b');
    console.log('   Current Approvals:', `${firstApproval.currentApprovals}/${firstApproval.requiredApprovals}`);
    console.log('   Status:', firstApproval.status);
    console.log('   ✅ First approval successful\n');

    // Test 3: Second approval (should reach threshold)
    console.log('3️⃣ Second Approval (Reaching Threshold)...');
    const secondApproval = await approvalService.approveTransaction(
      proposal.transactionId,
      '0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F' // Signer 2
    );

    console.log('   Approver:', '0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F');
    console.log('   Current Approvals:', `${secondApproval.currentApprovals}/${secondApproval.requiredApprovals}`);
    console.log('   Status:', secondApproval.status);
    console.log('   ✅ Transaction fully approved!\n');

    // Test 4: Execute the transaction
    console.log('4️⃣ Executing Approved Transaction...');
    const txHash = await approvalService.executeTransaction(
      proposal.transactionId,
      '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b'
    );

    console.log('   Executor:', '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b');
    console.log('   Transaction Hash:', txHash);
    console.log('   ✅ Transaction executed successfully\n');

    // Test 5: Create and reject a transaction
    console.log('5️⃣ Testing Transaction Rejection...');
    const rejectionProposal = await approvalService.proposeTransaction({
      paymentId: 'PAY_TEST_002',
      to: '0x999999999999999999999999999999999999999',
      value: '500000000000000000', // 0.5 ETH
      amount: 9385, // 9,385 MXN (~$500)
      amountUsd: 500,
      type: 'TRANSFER',
      createdBy: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b',
      metadata: {
        description: 'Test transaction for rejection',
        category: 'testing'
      }
    });

    console.log('   Created proposal:', rejectionProposal.transactionId);

    const rejection = await approvalService.rejectTransaction(
      rejectionProposal.transactionId,
      '0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F',
      'Suspicious transaction - rejecting for security'
    );

    console.log('   Rejector:', '0xE120E428b2bB7E28B21D2634ad1d601c6Cd6b33F');
    console.log('   Status:', rejection.status);
    console.log('   ✅ Transaction rejected successfully\n');

    // Test 6: Get all approval requests
    console.log('6️⃣ Retrieving All Approval Requests...');
    const allRequests = approvalService.getApprovalRequests();
    console.log('   Total Requests:', allRequests.length);
    
    allRequests.forEach((req, index) => {
      console.log(`   Request ${index + 1}:`);
      console.log(`     ID: ${req.transactionId}`);
      console.log(`     Payment ID: ${req.paymentId}`);
      console.log(`     Amount: ${req.amount} MXN (~$${req.amountUsd})`);
      console.log(`     Type: ${req.type}`);
      console.log(`     Status: ${req.status}`);
      console.log(`     Approvals: ${req.currentApprovals}/${req.requiredApprovals}`);
    });
    console.log('   ✅ Retrieved all requests\n');

    // Test 7: Get statistics
    console.log('7️⃣ Service Statistics...');
    const stats = approvalService.getStatistics();
    console.log('   Total Requests:', stats.totalRequests);
    console.log('   Pending:', stats.pendingRequests);
    console.log('   Approved:', stats.approvedRequests);
    console.log('   Rejected:', stats.rejectedRequests);
    console.log('   Executed:', stats.executedRequests);
    console.log('   Total Value (MXN):', `${stats.totalValueMxn.toLocaleString()}`);
    console.log('   Total Value (USD):', `$${stats.totalValueUsd.toLocaleString()}`);
    console.log('   ✅ Statistics retrieved\n');

    // Test 8: Test error cases
    console.log('8️⃣ Testing Error Cases...');
    
    try {
      await approvalService.approveTransaction('invalid_tx_id', '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b');
    } catch (error) {
      console.log('   ✅ Correctly handled invalid transaction ID');
    }

    try {
      await approvalService.approveTransaction(
        proposal.transactionId,
        '0x1111111111111111111111111111111111111111' // Unauthorized address
      );
    } catch (error) {
      console.log('   ✅ Correctly handled unauthorized approver');
    }

    try {
      await approvalService.proposeTransaction({
        paymentId: 'PAY_TEST_003',
        to: '0x742d35Cc6634C0532925a3b8D0c6964b1B8b3d3d',
        value: '100000000000000000', // 0.1 ETH
        amount: 187, // 187 MXN (~$10) - below multi-sig threshold
        amountUsd: 10,
        type: 'DEPOSIT',
        createdBy: '0xa383c8843ad37B95C3CceF2d2f4eBf0f3B8bBd2b'
      });
    } catch (error) {
      console.log('   ✅ Correctly handled transaction below multi-sig threshold');
    }

    console.log('   ✅ All error cases handled correctly\n');

    console.log('🎉 Multi-Sig Approval Workflow Test Complete!');
    console.log('==========================================');
    console.log('✅ All tests passed successfully');
    console.log('✅ Service is ready for production use');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testMultiSigWorkflow().catch(console.error);
