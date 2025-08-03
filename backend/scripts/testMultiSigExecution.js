const { Pool } = require('pg');

async function testMultiSigExecution() {
  console.log('🔧 TESTING MULTI-SIG EXECUTION CAPABILITY');
  console.log('============================================================');

  // Test environment variables
  console.log('\n📋 Environment Variables Check:');
  console.log(`   BRIDGE_WALLET_PRIVATE_KEY: ${process.env.BRIDGE_WALLET_PRIVATE_KEY ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   ESCROW_CONTRACT_ADDRESS: ${process.env.ESCROW_CONTRACT_ADDRESS || 'Not set'}`);
  console.log(`   ARBITRUM_SEPOLIA_RPC_URL: ${process.env.ARBITRUM_SEPOLIA_RPC_URL ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   MULTISIG_THRESHOLD_USD: ${process.env.MULTISIG_THRESHOLD_USD || 'Not set'}`);

  // Test database connection and check pending multi-sig transactions
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log('\n🔍 Checking Pending Multi-Sig Transactions:');
    
    const pendingApprovals = await pool.query(`
      SELECT 
        mar.id,
        mar.payment_id,
        mar.status,
        mar.approval_type,
        mar.required_signatures,
        mar.current_signatures,
        mar.wallet_address,
        p.amount,
        p.currency,
        p.recipient_email
      FROM multisig_approval_requests mar
      LEFT JOIN payment p ON p.id = mar.payment_id
      WHERE mar.status IN ('pending', 'approved')
      ORDER BY mar.created_at DESC
      LIMIT 10
    `);

    if (pendingApprovals.rows.length === 0) {
      console.log('   ℹ️  No pending multi-sig transactions found');
    } else {
      console.log(`   📊 Found ${pendingApprovals.rows.length} pending/approved transactions:`);
      
      pendingApprovals.rows.forEach(approval => {
        const status = approval.status === 'approved' ? '✅ APPROVED' : '⏳ PENDING';
        const signatures = `${approval.current_signatures}/${approval.required_signatures}`;
        console.log(`      • ID ${approval.id}: Payment ${approval.payment_id} - ${status} (${signatures}) - $${approval.amount} ${approval.currency}`);
      });
    }

    // Check recent failed executions
    console.log('\n🚨 Recent Execution Errors:');
    const recentErrors = await pool.query(`
      SELECT 
        mar.id,
        mar.payment_id,
        mar.status,
        mar.updated_at,
        p.amount,
        p.currency
      FROM multisig_approval_requests mar
      LEFT JOIN payment p ON p.id = mar.payment_id
      WHERE mar.status = 'failed' 
        AND mar.updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY mar.updated_at DESC
      LIMIT 5
    `);

    if (recentErrors.rows.length === 0) {
      console.log('   ✅ No recent execution failures');
    } else {
      console.log(`   ⚠️  Found ${recentErrors.rows.length} recent failures:`);
      recentErrors.rows.forEach(error => {
        console.log(`      • ID ${error.id}: Payment ${error.payment_id} - Failed at ${error.updated_at} - $${error.amount} ${error.currency}`);
      });
    }

    // Test wallet configuration access
    console.log('\n🔐 Wallet Configuration Test:');
    const walletConfigs = await pool.query(`
      SELECT 
        wallet_address,
        wallet_type,
        threshold_min_usd,
        threshold_max_usd,
        required_signatures,
        total_owners,
        is_active
      FROM multisig_wallet_configs
      WHERE is_active = true
      ORDER BY threshold_min_usd
    `);

    console.log(`   📋 Active wallet configurations: ${walletConfigs.rows.length}`);
    walletConfigs.rows.forEach(config => {
      console.log(`      • ${config.wallet_type}: $${config.threshold_min_usd}-$${config.threshold_max_usd || '∞'} (${config.required_signatures}/${config.total_owners})`);
    });

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }

  console.log('\n🎯 EXECUTION READINESS ASSESSMENT:');
  const bridgeKeySet = !!process.env.BRIDGE_WALLET_PRIVATE_KEY;
  const escrowAddressSet = !!process.env.ESCROW_CONTRACT_ADDRESS;
  const rpcUrlSet = !!process.env.ARBITRUM_SEPOLIA_RPC_URL;
  
  if (bridgeKeySet && escrowAddressSet && rpcUrlSet) {
    console.log('   ✅ READY FOR MULTI-SIG EXECUTION');
    console.log('   🚀 Pending transactions should now execute successfully');
  } else {
    console.log('   ❌ MISSING REQUIRED ENVIRONMENT VARIABLES');
    if (!bridgeKeySet) console.log('      - BRIDGE_WALLET_PRIVATE_KEY missing');
    if (!escrowAddressSet) console.log('      - ESCROW_CONTRACT_ADDRESS missing');
    if (!rpcUrlSet) console.log('      - ARBITRUM_SEPOLIA_RPC_URL missing');
  }
}

// Load environment variables
require('dotenv').config();

testMultiSigExecution().catch(console.error);
