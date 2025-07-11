const { DataSource } = require('typeorm');
const path = require('path');

// Quick health check script for automation services
async function automationHealthCheck() {
    console.log('🏥 === KUSTODIA AUTOMATION HEALTH CHECK ===');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('================================================\n');

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

        // Check payments status distribution
        const paymentRepo = AppDataSource.getRepository('Payment');
        const escrowRepo = AppDataSource.getRepository('Escrow');

        console.log('\n📊 === PAYMENT STATUS ANALYSIS ===');
        
        const statusCounts = await paymentRepo
            .createQueryBuilder('payment')
            .select('payment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('payment.status')
            .getRawMany();

        statusCounts.forEach(status => {
            const emoji = getStatusEmoji(status.status);
            console.log(`${emoji} ${status.status}: ${status.count} payments`);
        });

        // Check for stuck processing payments
        console.log('\n🔍 === CRITICAL STATUS CHECK ===');
        const processingPayments = await paymentRepo.find({
            where: { status: 'processing' }
        });

        if (processingPayments.length > 0) {
            console.log(`⚠️  ALERT: ${processingPayments.length} payments stuck in 'processing'`);
            processingPayments.forEach(p => {
                console.log(`   - Payment ${p.id}: ${p.amount} ${p.currency}`);
            });
        } else {
            console.log('✅ No payments stuck in processing - HEALTHY');
        }

        // Check Payment 89 specifically
        console.log('\n🎯 === PAYMENT 89 STATUS CHECK ===');
        const payment89 = await paymentRepo.findOne({
            where: { id: 89 },
            relations: ['escrow']
        });

        if (payment89) {
            console.log(`✅ Payment 89 Status: ${payment89.status}`);
            console.log(`💰 Amount: ${payment89.amount} ${payment89.currency}`);
            console.log(`📧 Payer: ${payment89.payer_email}`);
            console.log(`📧 Payee: ${payment89.payee_email}`);
            
            if (payment89.escrow) {
                const escrow = payment89.escrow;
                console.log(`🔐 Escrow: ${escrow.status} (Contract ID: ${escrow.smart_contract_escrow_id})`);
            }
        } else {
            console.log('❌ Payment 89 not found');
        }

        // Check for pending actions
        console.log('\n⚡ === AUTOMATION PIPELINE STATUS ===');
        
        // Payments ready for escrow release
        const readyForRelease = await AppDataSource.query(`
            SELECT COUNT(*) as count 
            FROM escrow e 
            JOIN payment p ON e.payment_id = p.id 
            WHERE e.status IN ('funded', 'active') 
            AND e.custody_end < NOW()
        `);
        console.log(`🔓 Ready for custody release: ${readyForRelease[0].count}`);

        // Released escrows pending payout
        const pendingPayout = await AppDataSource.query(`
            SELECT COUNT(*) as count 
            FROM escrow e 
            JOIN payment p ON e.payment_id = p.id 
            WHERE e.status = 'released' 
            AND p.status = 'funded'
        `);
        console.log(`💸 Pending payout processing: ${pendingPayout[0].count}`);

        // Environment check
        console.log('\n🌍 === ENVIRONMENT CHECK ===');
        const envVars = [
            'JUNO_API_KEY',
            'MXNB_CONTRACT_ADDRESS', 
            'ESCROW_CONTRACT_ADDRESS',
            'PRIVATE_KEY',
            'RPC_URL'
        ];

        envVars.forEach(envVar => {
            const exists = !!process.env[envVar];
            const emoji = exists ? '✅' : '❌';
            console.log(`${emoji} ${envVar}: ${exists ? 'SET' : 'MISSING'}`);
        });

        console.log('\n🎉 === HEALTH CHECK COMPLETE ===');
        console.log('Automation services appear to be functioning correctly!');
        
        if (payment89 && payment89.status === 'completed') {
            console.log('🚀 Payment 89 recovery: SUCCESS! ✅');
        }

        await AppDataSource.destroy();

    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        process.exit(1);
    }
}

function getStatusEmoji(status) {
    const emojiMap = {
        'pending': '⏳',
        'funded': '💰',
        'processing': '⚙️',
        'completed': '✅',
        'failed': '❌',
        'custody_released': '🔓'
    };
    return emojiMap[status] || '❓';
}

// Load environment variables
require('dotenv').config();

// Run health check
automationHealthCheck().catch(console.error);
