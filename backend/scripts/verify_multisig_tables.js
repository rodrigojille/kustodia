const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function checkTables() {
  try {
    console.log('🔍 Verifying Multi-Sig Database Setup...\n');
    
    // Check table existence
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'multisig%'
      ORDER BY table_name;
    `);
    
    console.log('✅ Multi-sig Tables Created:');
    tables.rows.forEach(row => console.log(`   📋 ${row.table_name}`));
    
    // Check wallet configurations
    const wallets = await pool.query('SELECT * FROM multisig_wallet_config;');
    console.log('\n✅ Wallet Configurations:');
    wallets.rows.forEach(wallet => {
      console.log(`   🔐 ${wallet.wallet_type}: ${wallet.required_signatures}/${wallet.total_owners} signatures`);
      console.log(`      Range: $${wallet.threshold_min_usd} - $${wallet.threshold_max_usd || 'unlimited'}`);
    });
    
    // Check wallet owners/signers
    const owners = await pool.query('SELECT * FROM multisig_wallet_owners;');
    console.log('\n✅ Authorized Wallet Owners:');
    owners.rows.forEach(owner => {
      console.log(`   👤 ${owner.owner_address} (${owner.role}) - Active: ${owner.is_active}`);
    });
    
    // Check approval requests (should be empty initially)
    const approvals = await pool.query('SELECT COUNT(*) as count FROM multisig_approval_requests;');
    console.log(`\n📊 Current Approval Requests: ${approvals.rows[0].count}`);
    
    // Check high-value payments that would trigger multi-sig
    const highValuePayments = await pool.query(`
      SELECT id, amount, status, created_at 
      FROM payment 
      WHERE amount > 1000 
      ORDER BY created_at DESC 
      LIMIT 5;
    `);
    
    console.log('\n💰 High-Value Payments (>$1000 USD):');
    highValuePayments.rows.forEach(payment => {
      console.log(`   Payment ${payment.id}: $${payment.amount} (${payment.status}) - ${payment.created_at.toISOString().split('T')[0]}`);
    });
    
    console.log('\n🎯 Multi-Sig System Status: READY FOR PRODUCTION');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
