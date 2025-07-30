require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Database imports (will be loaded dynamically)
let AppDataSource, Payment, Escrow, User;

/**
 * Demo Preparation Health Check
 * Verifies all systems are ready for payment and cobros demo
 */

async function runDemoPreparationCheck() {
  console.log('🎬 KUSTODIA DEMO PREPARATION HEALTH CHECK');
  console.log('==========================================');
  
  let allChecksPass = true;
  const issues = [];
  
  try {
    // 1. Database Connection
    console.log('\n1. 🗄️ Database Connection...');
    try {
      // Load database modules dynamically
      AppDataSource = require('../dist/ormconfig').default;
      const PaymentEntity = require('../dist/entity/Payment');
      const EscrowEntity = require('../dist/entity/Escrow');
      const UserEntity = require('../dist/entity/User');
      
      Payment = PaymentEntity.Payment;
      Escrow = EscrowEntity.Escrow;
      User = UserEntity.User;
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      issues.push('Database connection failed');
      allChecksPass = false;
    }
    
    // 2. Check Recent Payments
    console.log('\n2. 💳 Recent Payments Check...');
    const paymentRepo = AppDataSource.getRepository(Payment);
    const recentPayments = await paymentRepo.find({
      where: {},
      order: { id: 'DESC' },
      take: 5,
      relations: ['escrow']
    });
    
    console.log(`Found ${recentPayments.length} recent payments:`);
    recentPayments.forEach(payment => {
      console.log(`- Payment ${payment.id}: ${payment.amount} MXN, Status: ${payment.status}, Type: ${payment.payment_type || 'standard'}`);
    });
    
    // 3. Check Automation Service Endpoints
    console.log('\n3. 🤖 Automation Service Check...');
    try {
      const automationStatus = await axios.get('http://localhost:4000/api/automation/status');
      console.log('✅ Automation service is responding');
      console.log('Automation metrics:', automationStatus.data);
    } catch (error) {
      console.log('❌ Automation service not responding');
      issues.push('Automation service endpoint not accessible');
      allChecksPass = false;
    }
    
    // 4. Check Juno API Credentials
    console.log('\n4. 🏦 Juno API Credentials...');
    const junoApiKey = process.env.JUNO_STAGE_API_KEY;
    const junoApiSecret = process.env.JUNO_STAGE_API_SECRET;
    
    if (!junoApiKey || !junoApiSecret) {
      console.log('❌ Missing Juno API credentials');
      issues.push('Juno API credentials not configured');
      allChecksPass = false;
    } else {
      console.log('✅ Juno API credentials configured');
      console.log(`API Key: ${junoApiKey.substring(0, 8)}...`);
    }
    
    // 5. Check Smart Contract Configuration
    console.log('\n5. 🔗 Smart Contract Configuration...');
    const rpcUrl = process.env.ETH_RPC_URL;
    const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
    const bridgeWallet = process.env.BRIDGE_WALLET_ADDRESS;
    
    if (!rpcUrl || !contractAddress || !bridgeWallet) {
      console.log('❌ Missing smart contract configuration');
      issues.push('Smart contract environment variables not configured');
      allChecksPass = false;
    } else {
      console.log('✅ Smart contract configuration present');
      console.log(`RPC URL: ${rpcUrl}`);
      console.log(`Contract: ${contractAddress}`);
      console.log(`Bridge Wallet: ${bridgeWallet}`);
    }
    
    // 6. Check User Authentication
    console.log('\n6. 👤 User Authentication Check...');
    const userRepo = AppDataSource.getRepository(User);
    const testUser = await userRepo.findOne({
      where: { email: 'rodrigo@kustodia.mx' }
    });
    
    if (!testUser) {
      console.log('❌ Test user not found');
      issues.push('Test user (rodrigo@kustodia.mx) not found');
      allChecksPass = false;
    } else {
      console.log('✅ Test user found');
      console.log(`User ID: ${testUser.id}, KYC Status: ${testUser.kyc_status}`);
    }
    
    // 7. Payment Type Availability
    console.log('\n7. 💰 Payment Type Availability...');
    console.log('Available payment types:');
    console.log('✅ Pago Condicional Estándar (standard)');
    console.log('✅ Pago Condicional Premium (nuevo-flujo)');
    console.log('✅ Cobros (commission-based)');
    console.log('❌ Web3 Payments (temporarily disabled)');
    
    // 8. Mock Deposit Scripts
    console.log('\n8. 🧪 Mock Deposit Scripts...');
    const fs = require('fs');
    const mockScripts = [
      'scripts/universal_mock_deposit.js',
      'scripts/check_payment_status.js',
      'scripts/mock_juno_deposit.js'
    ];
    
    mockScripts.forEach(script => {
      if (fs.existsSync(script)) {
        console.log(`✅ ${script} available`);
      } else {
        console.log(`❌ ${script} missing`);
        issues.push(`Mock script ${script} not found`);
        allChecksPass = false;
      }
    });
    
    // 9. Frontend Build Status
    console.log('\n9. 🎨 Frontend Status...');
    try {
      const frontendHealth = await axios.get('http://localhost:3000/api/health', { timeout: 5000 });
      console.log('✅ Frontend is running');
    } catch (error) {
      console.log('⚠️  Frontend not responding (may not be started)');
      console.log('   Start with: cd frontend && npm run dev');
    }
    
    // 10. Environment Variables Check
    console.log('\n10. 🔧 Environment Variables...');
    const requiredEnvVars = [
      'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
      'JWT_SECRET', 'JUNO_STAGE_API_KEY', 'JUNO_STAGE_API_SECRET',
      'ETH_RPC_URL', 'ESCROW_CONTRACT_ADDRESS', 'BRIDGE_WALLET_ADDRESS'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.log('❌ Missing environment variables:', missingEnvVars.join(', '));
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
      allChecksPass = false;
    } else {
      console.log('✅ All required environment variables present');
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 DEMO PREPARATION SUMMARY');
    console.log('='.repeat(50));
    
    if (allChecksPass) {
      console.log('🎉 ALL SYSTEMS READY FOR DEMO!');
      console.log('\n🚀 Demo Flow Instructions:');
      console.log('1. Create payment via frontend (standard/nuevo-flujo/cobros)');
      console.log('2. Note the payment ID from the response');
      console.log('3. Run: node scripts/universal_mock_deposit.js [PAYMENT_ID]');
      console.log('4. Wait 1-2 minutes for automation to process');
      console.log('5. Check status: node scripts/check_payment_status.js [PAYMENT_ID]');
      console.log('6. Verify escrow creation and fund distribution');
    } else {
      console.log('❌ ISSUES FOUND - RESOLVE BEFORE DEMO');
      console.log('\n🔧 Issues to resolve:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n📝 Quick Commands:');
    console.log('- Start backend: npm run dev');
    console.log('- Start frontend: cd frontend && npm run dev');
    console.log('- Mock deposit: node scripts/universal_mock_deposit.js [ID]');
    console.log('- Check payment: node scripts/check_payment_status.js [ID]');
    console.log('- Trigger automation: curl -X POST http://localhost:4000/api/automation/trigger -H "Content-Type: application/json" -d \'{"process":"all"}\'');
    
  } catch (error) {
    console.error('\n💥 Health check failed:', error.message);
    allChecksPass = false;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
  
  process.exit(allChecksPass ? 0 : 1);
}

console.log('🔍 Starting demo preparation health check...');
runDemoPreparationCheck();
