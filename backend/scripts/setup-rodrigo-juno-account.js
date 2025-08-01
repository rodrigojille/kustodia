#!/usr/bin/env node

/**
 * Setup Juno Bank Account for rodrigo@kustodia.mx
 * 
 * This script handles the bank account registration process for Rodrigo
 * when he receives his first payment and needs a Juno bank account ID
 * for MXNB redemption to his personal bank account.
 */

const { registerBankAccount } = require('../src/services/junoService');
const { AppDataSource } = require('../src/config/ormconfig');
const { User } = require('../src/entities/User');

async function setupRodrigoBankAccount() {
    console.log('🏦 Setting up Juno bank account for rodrigo@kustodia.mx...\n');
    
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('✅ Database connected');
        
        // Find Rodrigo's user account
        const userRepo = AppDataSource.getRepository(User);
        const rodrigo = await userRepo.findOne({ 
            where: { email: 'rodrigo@kustodia.mx' } 
        });
        
        if (!rodrigo) {
            console.log('❌ User rodrigo@kustodia.mx not found in database');
            console.log('   Please create user account first');
            return;
        }
        
        console.log(`✅ Found user: ${rodrigo.email}`);
        console.log(`   User ID: ${rodrigo.id}`);
        console.log(`   Name: ${rodrigo.firstName} ${rodrigo.lastName}`);
        
        // Check if already has Juno bank account ID
        if (rodrigo.junoBankAccountId) {
            console.log(`✅ User already has Juno bank account ID: ${rodrigo.junoBankAccountId}`);
            console.log('   No action needed');
            return;
        }
        
        // Rodrigo's bank account details
        const RODRIGO_CLABE = '646180157000000004'; // His actual CLABE
        const ACCOUNT_HOLDER_NAME = 'Rodrigo Jille';
        
        console.log(`\n🔄 Registering bank account with Juno...`);
        console.log(`   CLABE: ${RODRIGO_CLABE}`);
        console.log(`   Account Holder: ${ACCOUNT_HOLDER_NAME}`);
        
        // Register bank account with Juno
        const registrationResult = await registerBankAccount(
            RODRIGO_CLABE, 
            ACCOUNT_HOLDER_NAME
        );
        
        console.log('✅ Juno bank account registered successfully!');
        console.log(`   Juno Bank Account ID: ${registrationResult.id}`);
        console.log(`   Status: ${registrationResult.status || 'active'}`);
        
        // Update user record with Juno bank account ID
        rodrigo.junoBankAccountId = registrationResult.id;
        rodrigo.clabe = RODRIGO_CLABE;
        await userRepo.save(rodrigo);
        
        console.log('✅ User record updated with Juno bank account ID');
        
        // Verify the update
        const updatedRodrigo = await userRepo.findOne({ 
            where: { email: 'rodrigo@kustodia.mx' } 
        });
        
        console.log('\n📊 Final Status:');
        console.log(`   Email: ${updatedRodrigo.email}`);
        console.log(`   Juno Bank Account ID: ${updatedRodrigo.junoBankAccountId}`);
        console.log(`   CLABE: ${updatedRodrigo.clabe}`);
        console.log(`   Ready for payments: ✅`);
        
        console.log('\n🎯 Next Steps:');
        console.log('   1. Create test payment to rodrigo@kustodia.mx');
        console.log('   2. Fund the payment via SPEI deposit');
        console.log('   3. Release payment to trigger MXNB redemption');
        console.log('   4. Verify funds arrive in Rodrigo\'s bank account');
        
    } catch (error) {
        console.error('❌ Error setting up Juno bank account:', error);
        
        if (error.response) {
            console.error('   Juno API Error:', error.response.data);
            console.error('   Status:', error.response.status);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Verify Juno API credentials are correct');
        console.log('   2. Check if CLABE is valid and belongs to Rodrigo');
        console.log('   3. Ensure Juno API is accessible from this environment');
        console.log('   4. Verify database connection and user exists');
        
    } finally {
        // Close database connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Auto-run if called directly
if (require.main === module) {
    setupRodrigoBankAccount()
        .then(() => {
            console.log('\n✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { setupRodrigoBankAccount };
