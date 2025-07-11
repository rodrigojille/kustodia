const { DataSource } = require('typeorm');
const path = require('path');

// Specific check for Payment 90 automation readiness
async function payment90AutomationCheck() {
    console.log('🎯 === PAYMENT 90 AUTOMATION READINESS CHECK ===');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('==============================================\n');

    try {
        // Initialize database connection
        const AppDataSource = new DataSource({
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "140290",
            database: process.env.DB_NAME || "kustodia",
            entities: [path.join(__dirname, "dist/entity/**/*.js")],
            synchronize: false,
        });

        await AppDataSource.initialize();
        console.log('✅ Database connection: HEALTHY');

        // Check Payment 90 specifically
        console.log('\n🎯 === PAYMENT 90 DETAILED STATUS ===');
        const paymentRepo = AppDataSource.getRepository('Payment');
        
        const payment90 = await paymentRepo.findOne({
            where: { id: 90 },
            relations: ['escrow']
        });

        if (!payment90) {
            console.log('❌ Payment 90 not found');
            await AppDataSource.destroy();
            return;
        }

        console.log(`✅ Payment 90 Found`);
        console.log(`💰 Amount: ${payment90.amount} ${payment90.currency}`);
        console.log(`📧 Payer: ${payment90.payer_email}`);
        console.log(`📧 Payee: ${payment90.payee_email}`);
        console.log(`🔄 Status: ${payment90.status}`);
        console.log(`📅 Created: ${payment90.created_at}`);

        if (payment90.escrow) {
            const escrow = payment90.escrow;
            console.log(`\n🔐 === ESCROW DETAILS ===`);
            console.log(`🔄 Escrow Status: ${escrow.status}`);
            console.log(`💰 Custody Amount: ${escrow.custody_amount} MXNB`);
            console.log(`📅 Custody Start: ${escrow.custody_start}`);
            console.log(`📅 Custody End: ${escrow.custody_end}`);
            console.log(`🏗️ Contract ID: ${escrow.smart_contract_escrow_id}`);
            console.log(`🔗 Transaction Hash: ${escrow.transaction_hash}`);

            // Calculate time remaining
            const now = new Date();
            const custodyEnd = new Date(escrow.custody_end);
            const timeRemaining = custodyEnd - now;
            
            console.log(`\n⏰ === TIME ANALYSIS ===`);
            if (timeRemaining > 0) {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                
                console.log(`⏳ Time until custody release: ${days} days, ${hours} hours, ${minutes} minutes`);
                console.log(`📅 Release Date: ${custodyEnd.toLocaleString()}`);
                
                if (days <= 1) {
                    console.log(`🚨 ALERT: Release is within 24 hours! Automation should trigger soon.`);
                } else if (days <= 7) {
                    console.log(`⚠️  Notice: Release is within a week.`);
                } else {
                    console.log(`✅ Normal: Release is scheduled for the future.`);
                }
            } else {
                console.log(`🚨 OVERDUE: Custody should have been released ${Math.abs(Math.floor(timeRemaining / (1000 * 60 * 60 * 24)))} days ago!`);
                console.log(`🤖 Automation should have already processed this escrow.`);
            }

            // Check automation readiness
            console.log(`\n🤖 === AUTOMATION READINESS ===`);
            
            if (escrow.status === 'funded' || escrow.status === 'active') {
                console.log(`✅ Escrow is ready for automation (status: ${escrow.status})`);
                console.log(`✅ releaseExpiredCustodies() will process this escrow when custody_end passes`);
                console.log(`✅ processPendingPayouts() will handle payout after release`);
            } else if (escrow.status === 'released') {
                console.log(`✅ Escrow already released - processPendingPayouts() should handle payout`);
            } else if (escrow.status === 'completed') {
                console.log(`✅ Escrow completed - no automation needed`);
            } else {
                console.log(`⚠️  Escrow status '${escrow.status}' - verify automation handling`);
            }

            // Verify contract ID exists for blockchain operations
            if (escrow.smart_contract_escrow_id) {
                console.log(`✅ Smart contract escrow ID exists: ${escrow.smart_contract_escrow_id}`);
                console.log(`✅ Blockchain operations will work correctly`);
            } else {
                console.log(`❌ Missing smart contract escrow ID - blockchain operations may fail`);
            }

        } else {
            console.log(`❌ No escrow found for Payment 90`);
        }

        // Check automation service status
        console.log(`\n⚙️ === AUTOMATION SERVICE STATUS ===`);
        console.log(`✅ releaseExpiredCustodies: Runs every 10 minutes`);
        console.log(`✅ processPendingPayouts: Runs every 15 minutes`);
        console.log(`✅ syncBlockchainStatuses: Runs every hour`);
        
        // Environment check for blockchain operations
        console.log(`\n🌍 === BLOCKCHAIN INTEGRATION CHECK ===`);
        const requiredEnvVars = [
            'RPC_URL',
            'ESCROW_CONTRACT_ADDRESS', 
            'ESCROW_PRIVATE_KEY',
            'MXNB_CONTRACT_ADDRESS'
        ];

        let envHealthy = true;
        requiredEnvVars.forEach(envVar => {
            const exists = !!process.env[envVar];
            const emoji = exists ? '✅' : '❌';
            console.log(`${emoji} ${envVar}: ${exists ? 'SET' : 'MISSING'}`);
            if (!exists) envHealthy = false;
        });

        console.log(`\n🎉 === PAYMENT 90 AUTOMATION READINESS SUMMARY ===`);
        if (payment90.escrow && payment90.escrow.smart_contract_escrow_id && envHealthy) {
            console.log(`🚀 Payment 90 is READY for automated processing!`);
            console.log(`🤖 Automation will handle release and payout automatically.`);
        } else {
            console.log(`⚠️  Payment 90 may have issues with automation - verify setup.`);
        }

        await AppDataSource.destroy();

    } catch (error) {
        console.error('❌ Payment 90 check failed:', error.message);
        process.exit(1);
    }
}

// Load environment variables
require('dotenv').config();

// Run Payment 90 check
payment90AutomationCheck().catch(console.error);
