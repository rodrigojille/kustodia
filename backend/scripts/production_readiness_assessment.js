require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kustodia',
  password: '140290',
  port: 5432,
});

async function assessProductionReadiness() {
  console.log('🚀 KUSTODIA PRODUCTION READINESS ASSESSMENT');
  console.log('==========================================\n');
  
  const results = {
    database: { score: 0, maxScore: 0, issues: [] },
    multisig: { score: 0, maxScore: 0, issues: [] },
    automation: { score: 0, maxScore: 0, issues: [] },
    security: { score: 0, maxScore: 0, issues: [] },
    integration: { score: 0, maxScore: 0, issues: [] }
  };

  try {
    // 1. DATABASE ASSESSMENT
    console.log('📊 DATABASE ASSESSMENT');
    console.log('=====================');
    
    // Check critical tables
    const criticalTables = [
      'user', 'payment', 'escrow', 'multisig_approval_requests',
      'multisig_wallet_config', 'multisig_wallet_owners'
    ];
    
    results.database.maxScore += 10;
    let tablesExist = 0;
    
    for (const table of criticalTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        );
      `, [table]);
      
      if (exists.rows[0].exists) {
        tablesExist++;
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        results.database.issues.push(`Missing table: ${table}`);
      }
    }
    
    results.database.score += (tablesExist / criticalTables.length) * 10;
    
    // Check payment data integrity
    results.database.maxScore += 10;
    const paymentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN amount > 1000 THEN 1 END) as high_value_payments,
        COUNT(CASE WHEN status = 'escrowed' THEN 1 END) as escrowed_payments
      FROM payment;
    `);
    
    const stats = paymentStats.rows[0];
    console.log(`   📈 Total Payments: ${stats.total_payments}`);
    console.log(`   💰 High-Value Payments: ${stats.high_value_payments}`);
    console.log(`   🔒 Escrowed Payments: ${stats.escrowed_payments}`);
    
    if (stats.total_payments > 0) results.database.score += 5;
    if (stats.high_value_payments > 0) results.database.score += 5;
    
    // 2. MULTI-SIG ASSESSMENT
    console.log('\n🔐 MULTI-SIG ASSESSMENT');
    console.log('======================');
    
    results.multisig.maxScore += 20;
    
    // Check wallet configuration
    const walletConfig = await pool.query('SELECT * FROM multisig_wallet_config;');
    if (walletConfig.rows.length > 0) {
      results.multisig.score += 5;
      console.log(`   ✅ Wallet configurations: ${walletConfig.rows.length}`);
      walletConfig.rows.forEach(config => {
        console.log(`      🔐 ${config.wallet_type}: ${config.required_signatures}/${config.total_owners} sigs`);
      });
    } else {
      results.multisig.issues.push('No wallet configurations found');
    }
    
    // Check wallet owners
    const walletOwners = await pool.query('SELECT * FROM multisig_wallet_owners;');
    if (walletOwners.rows.length >= 2) {
      results.multisig.score += 5;
      console.log(`   ✅ Wallet owners configured: ${walletOwners.rows.length}`);
    } else {
      results.multisig.issues.push('Insufficient wallet owners (need at least 2)');
    }
    
    // Check service integration
    const serviceFiles = [
      'src/services/MultiSigService.ts',
      'src/controllers/multiSigController.ts'
    ];
    
    let servicesExist = 0;
    for (const file of serviceFiles) {
      if (fs.existsSync(path.join(__dirname, '..', file))) {
        servicesExist++;
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - MISSING`);
        results.multisig.issues.push(`Missing service file: ${file}`);
      }
    }
    results.multisig.score += (servicesExist / serviceFiles.length) * 10;
    
    // 3. AUTOMATION ASSESSMENT
    console.log('\n⚙️ AUTOMATION ASSESSMENT');
    console.log('========================');
    
    results.automation.maxScore += 15;
    
    // Check automation service
    const automationService = 'src/services/PaymentAutomationService.ts';
    if (fs.existsSync(path.join(__dirname, '..', automationService))) {
      results.automation.score += 5;
      console.log(`   ✅ ${automationService}`);
    } else {
      results.automation.issues.push('PaymentAutomationService missing');
    }
    
    // Check recent automation activity
    const recentActivity = await pool.query(`
      SELECT COUNT(*) as count 
      FROM payment 
      WHERE updated_at > NOW() - INTERVAL '24 hours' 
      AND status IN ('funded', 'released', 'completed');
    `);
    
    if (recentActivity.rows[0].count > 0) {
      results.automation.score += 5;
      console.log(`   ✅ Recent automation activity: ${recentActivity.rows[0].count} payments`);
    } else {
      console.log(`   ⚠️ No recent automation activity`);
    }
    
    // Check escrow transactions
    const escrowCount = await pool.query('SELECT COUNT(*) as count FROM escrow;');
    if (escrowCount.rows[0].count > 0) {
      results.automation.score += 5;
      console.log(`   ✅ Escrow transactions: ${escrowCount.rows[0].count}`);
    } else {
      results.automation.issues.push('No escrow transactions found');
    }
    
    // 4. SECURITY ASSESSMENT
    console.log('\n🛡️ SECURITY ASSESSMENT');
    console.log('======================');
    
    results.security.maxScore += 20;
    
    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL', 'JWT_SECRET', 'PORTAL_CLIENT_API_KEY', 'JUNO_API_KEY', 'TRUORA_API_KEY'
    ];
    
    let envVarsSet = 0;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        envVarsSet++;
        console.log(`   ✅ ${envVar}`);
      } else {
        console.log(`   ❌ ${envVar} - NOT SET`);
        results.security.issues.push(`Missing environment variable: ${envVar}`);
      }
    }
    results.security.score += (envVarsSet / requiredEnvVars.length) * 10;
    
    // Check admin users
    const adminCount = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE role = 'admin' AND email_verified = true
    `);
    if (adminCount.rows[0].count > 0) {
      results.security.score += 10;
      console.log(`   ✅ Verified admin users: ${adminCount.rows[0].count}`);
    } else {
      results.security.issues.push('No verified admin users found');
    }
    
    // Check KYC integration
    const kycUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE kyc_status = 'approved';
    `);
    
    if (kycUsers.rows[0].count > 0) {
      results.security.score += 5;
      console.log(`   ✅ KYC verified users: ${kycUsers.rows[0].count}`);
    } else {
      results.security.issues.push('No KYC verified users found');
    }
    
    // 5. INTEGRATION ASSESSMENT
    console.log('\n🔗 INTEGRATION ASSESSMENT');
    console.log('=========================');
    
    results.integration.maxScore += 15;
    
    // Check Portal integration
    const portalUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE portal_client_id IS NOT NULL AND wallet_address IS NOT NULL;
    `);
    
    if (portalUsers.rows[0].count > 0) {
      results.integration.score += 5;
      console.log(`   ✅ Portal wallet users: ${portalUsers.rows[0].count}`);
    } else {
      results.integration.issues.push('No Portal wallet users found');
    }
    
    // Check Juno integration
    const junoUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "user" 
      WHERE deposit_clabe IS NOT NULL;
    `);
    
    if (junoUsers.rows[0].count > 0) {
      results.integration.score += 5;
      console.log(`   ✅ Juno CLABE users: ${junoUsers.rows[0].count}`);
    } else {
      results.integration.issues.push('No Juno CLABE users found');
    }
    
    // Check blockchain payments
    const blockchainPayments = await pool.query(`
      SELECT COUNT(*) as count 
      FROM payment 
      WHERE blockchain_tx_hash IS NOT NULL
    `);
    if (blockchainPayments.rows[0].count > 0) {
      results.integration.score += 5;
      console.log(`   ✅ Blockchain payments: ${blockchainPayments.rows[0].count}`);
    } else {
      results.integration.issues.push('No blockchain payments found');
    }
    
    // FINAL ASSESSMENT
    console.log('\n PRODUCTION READINESS SUMMARY');
    console.log('===============================');
    
    const totalScore = Object.values(results).reduce((sum, category) => sum + category.score, 0);
    const maxTotalScore = Object.values(results).reduce((sum, category) => sum + category.maxScore, 0);
    const percentage = Math.round((totalScore / maxTotalScore) * 100);
    
    console.log(`\n🎯 OVERALL SCORE: ${totalScore}/${maxTotalScore} (${percentage}%)`);
    
    Object.entries(results).forEach(([category, result]) => {
      const categoryPercentage = Math.round((result.score / result.maxScore) * 100);
      const status = categoryPercentage >= 80 ? '✅' : categoryPercentage >= 60 ? '⚠️' : '❌';
      console.log(`   ${status} ${category.toUpperCase()}: ${result.score}/${result.maxScore} (${categoryPercentage}%)`);
    });
    
    // Issues summary
    const allIssues = Object.values(results).flatMap(r => r.issues);
    if (allIssues.length > 0) {
      console.log('\n⚠️ ISSUES TO ADDRESS:');
      allIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // Production readiness verdict
    console.log('\n🚀 PRODUCTION READINESS VERDICT:');
    if (percentage >= 85) {
      console.log('   ✅ READY FOR PRODUCTION DEPLOYMENT');
    } else if (percentage >= 70) {
      console.log('   ⚠️ NEEDS MINOR FIXES BEFORE PRODUCTION');
    } else {
      console.log('   ❌ REQUIRES SIGNIFICANT WORK BEFORE PRODUCTION');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Assessment Error:', error.message);
    process.exit(1);
  }
}

assessProductionReadiness();
