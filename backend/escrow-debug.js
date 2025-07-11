const { DataSource } = require('typeorm');
const path = require('path');

// Debug escrow status mismatch between health check and dashboard
async function debugEscrowStatus() {
    console.log('🔍 === ESCROW STATUS DEBUG ===');
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('===============================\n');

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
        console.log('✅ Database connection: HEALTHY\n');

        // 1. Check ALL escrows with status breakdown
        console.log('📊 === ALL ESCROWS BY STATUS ===');
        const escrowRepo = AppDataSource.getRepository('Escrow');
        
        const allEscrows = await escrowRepo
            .createQueryBuilder('escrow')
            .leftJoinAndSelect('escrow.payment', 'payment')
            .orderBy('escrow.id', 'DESC')
            .getMany();

        const statusBreakdown = {};
        allEscrows.forEach(escrow => {
            const status = escrow.status || 'null';
            if (!statusBreakdown[status]) {
                statusBreakdown[status] = [];
            }
            statusBreakdown[status].push({
                id: escrow.id,
                paymentId: escrow.payment?.id,
                amount: escrow.custody_amount,
                contractId: escrow.smart_contract_escrow_id
            });
        });

        Object.keys(statusBreakdown).forEach(status => {
            const count = statusBreakdown[status].length;
            console.log(`${status}: ${count} escrows`);
            if (count <= 5) { // Show details if few escrows
                statusBreakdown[status].forEach(escrow => {
                    console.log(`  - Escrow ${escrow.id} (Payment ${escrow.paymentId}): ${escrow.amount} MXNB`);
                });
            }
        });

        // 2. Check current admin dashboard logic
        console.log('\n🎯 === ADMIN DASHBOARD LOGIC ===');
        const activeEscrowsQuery = await escrowRepo
            .createQueryBuilder('escrow')
            .where('escrow.status NOT IN (:...statuses)', { 
                statuses: ['completed', 'failed', 'released'] 
            })
            .getCount();

        console.log(`Active escrows (NOT completed/failed/released): ${activeEscrowsQuery}`);

        // 3. Check alternative logic for "in custody"
        console.log('\n🔐 === "PAGOS EN CUSTODIA" LOGIC ===');
        const paymentsInCustody = await AppDataSource.getRepository('Payment')
            .createQueryBuilder('payment')
            .where('payment.status = :status', { status: 'escrowed' })
            .getCount();

        console.log(`Payments with status 'escrowed': ${paymentsInCustody}`);

        const activeEscrowsWithActivePayments = await escrowRepo
            .createQueryBuilder('escrow')
            .leftJoin('escrow.payment', 'payment')
            .where('escrow.status IN (:...statuses)', { 
                statuses: ['active', 'funded'] 
            })
            .andWhere('payment.status = :paymentStatus', { paymentStatus: 'escrowed' })
            .getCount();

        console.log(`Active escrows with escrowed payments: ${activeEscrowsWithActivePayments}`);

        // 4. Specific Payment 90 analysis
        console.log('\n🎯 === PAYMENT 90 DETAILED ANALYSIS ===');
        const payment90 = await AppDataSource.getRepository('Payment')
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.escrow', 'escrow')
            .where('payment.id = :id', { id: 90 })
            .getOne();

        if (payment90) {
            console.log(`Payment 90 Status: ${payment90.status}`);
            if (payment90.escrow) {
                console.log(`Escrow ${payment90.escrow.id} Status: ${payment90.escrow.status}`);
                console.log(`Should be counted in dashboard? ${!['completed', 'failed', 'released'].includes(payment90.escrow.status)}`);
            } else {
                console.log('❌ No escrow found for Payment 90!');
            }
        }

        // 5. Recommend fix
        console.log('\n💡 === RECOMMENDATIONS ===');
        if (activeEscrowsQuery !== paymentsInCustody) {
            console.log('🚨 DISCREPANCY FOUND: Active escrows count != escrowed payments count');
            console.log(`   Admin dashboard shows: ${activeEscrowsQuery} active escrows`);
            console.log(`   Main dashboard shows: ${paymentsInCustody} pagos en custodia`);
            console.log('   ➡️ These should match for consistency');
        } else {
            console.log('✅ Counts match - issue may be frontend caching or API call failure');
        }

        await AppDataSource.destroy();

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

// Load environment variables
require('dotenv').config();

// Run debug
debugEscrowStatus().catch(console.error);
