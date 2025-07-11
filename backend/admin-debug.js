const { DataSource } = require('typeorm');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

// Debug admin dashboard issues
async function debugAdminDashboard() {
    console.log('🔍 === ADMIN DASHBOARD DEBUG ===');
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

        // 1. Test the exact same query logic as the endpoint
        console.log('🎯 === TESTING SYSTEM OVERVIEW LOGIC ===');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get today's payments
        const todayPayments = await AppDataSource.getRepository('Payment')
            .createQueryBuilder('payment')
            .where('DATE(payment.created_at) = DATE(:today)', { today })
            .getCount();
        console.log(`Today's payments: ${todayPayments}`);

        // Get active escrows - EXACT SAME LOGIC AS BACKEND
        const activeEscrows = await AppDataSource.getRepository('Escrow')
            .createQueryBuilder('escrow')
            .leftJoin('escrow.payment', 'payment')
            .where('escrow.status IN (:...statuses)', { 
                statuses: ['active', 'funded'] 
            })
            .andWhere('payment.status = :paymentStatus', { paymentStatus: 'escrowed' })
            .getCount();
        console.log(`Active escrows (backend logic): ${activeEscrows}`);

        // Double-check Payment 90 specifically
        const payment90 = await AppDataSource.getRepository('Payment')
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.escrow', 'escrow')
            .where('payment.id = :id', { id: 90 })
            .getOne();

        if (payment90) {
            console.log(`Payment 90 details:`);
            console.log(`  - Payment status: ${payment90.status}`);
            console.log(`  - Escrow status: ${payment90.escrow?.status}`);
            console.log(`  - Should be counted: ${payment90.status === 'escrowed' && ['active', 'funded'].includes(payment90.escrow?.status)}`);
        }

        // 2. Test service health checks
        console.log('\n🏥 === TESTING SERVICE HEALTH ===');
        
        // Database health
        try {
            await AppDataSource.query('SELECT 1');
            console.log('✅ Database: HEALTHY');
        } catch (error) {
            console.log('❌ Database: ERROR');
        }

        // Juno API health
        try {
            const junoBaseUrl = process.env.JUNO_ENV === 'stage' 
                ? 'https://stage.buildwithjuno.com' 
                : 'https://buildwithjuno.com';
            
            const response = await axios.get(`${junoBaseUrl}/ping`, { 
                timeout: 5000,
                validateStatus: () => true
            });
            const junoHealthy = response.status < 500;
            console.log(`${junoHealthy ? '✅' : '❌'} Juno API: ${junoHealthy ? 'HEALTHY' : 'ERROR'} (status: ${response.status})`);
        } catch (error) {
            console.log('❌ Juno API: ERROR (cannot connect)');
        }

        // 3. Test the full endpoint simulation
        console.log('\n🔄 === SIMULATING ENDPOINT RESPONSE ===');
        
        const serviceHealth = {
            database: true,
            backend: true,
            junoApi: false, // Will be updated by actual check
            bridgeWallet: true,
            mxnbContract: true
        };

        const automationStatus = {
            payoutProcessor: 'running',
            escrowMonitor: 'running', 
            bridgeTransfers: serviceHealth.bridgeWallet ? 'active' : 'error',
            mxnbRedemptions: serviceHealth.junoApi ? 'active' : 'error'
        };

        const mockResponse = {
            overview: {
                systemStatus: serviceHealth.database && serviceHealth.backend ? 'active' : 'error',
                automationStatus: automationStatus.payoutProcessor === 'running' ? 'running' : 'error',
                todayPayments,
                activeEscrows,
                pendingPayouts: 0, // Skip complex query for now
                failedPayments: 0   // Skip complex query for now
            },
            serviceHealth,
            automationStatus
        };

        console.log('Expected response:');
        console.log(JSON.stringify(mockResponse, null, 2));

        // 4. Check environment variables
        console.log('\n🔧 === ENVIRONMENT VARIABLES ===');
        console.log(`JUNO_ENV: ${process.env.JUNO_ENV || 'NOT SET'}`);
        console.log(`RPC_URL: ${process.env.RPC_URL ? 'SET' : 'NOT SET'}`);

        // 5. Direct endpoint test - CORRECT PORT 3000
        console.log('\n🌐 === TESTING ACTUAL ENDPOINT (PORT 3000) ===');
        try {
            // This won't work without auth token, but will show if server is responding
            const response = await axios.get('http://localhost:3000/api/admin/system/overview', {
                timeout: 5000,
                validateStatus: () => true // Don't throw on any status
            });
            console.log(`Endpoint response status: ${response.status}`);
            if (response.status === 401) {
                console.log('✅ Endpoint exists (401 = needs auth)');
            } else {
                console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
            }
        } catch (error) {
            console.log(`❌ Endpoint error: ${error.message}`);
        }

        await AppDataSource.destroy();

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

// Run debug
debugAdminDashboard().catch(console.error);
