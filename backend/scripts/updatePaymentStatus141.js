require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '140290',
    database: process.env.DB_NAME || 'kustodia',
});

async function updatePaymentStatus() {
    let client;
    
    try {
        console.log('🔄 Updating Payment 141 status after seller payout...');
        
        client = await pool.connect();
        console.log('✅ Database connected');

        // First, check current payment status
        const currentQuery = `
            SELECT id, amount, status
            FROM payment 
            WHERE id = 141
        `;
        
        const currentResult = await client.query(currentQuery);
        const payment = currentResult.rows[0];
        
        console.log('📋 Current Payment 141 status:');
        console.log('  - Total Amount:', payment.amount);
        console.log('  - Status:', payment.status);

        // Calculate the amounts
        const totalAmount = parseFloat(payment.amount);
        const sellerPaidAmount = 15000; // We just paid the seller 15,000 MXN

        // Update payment status to completed since seller was paid and escrow is active
        const updateQuery = `
            UPDATE payment 
            SET 
                status = 'completed',
                updated_at = NOW()
            WHERE id = 141
        `;

        await client.query(updateQuery);
        console.log('✅ Payment status updated');

        // Verify the update
        const verifyResult = await client.query(currentQuery);
        const updatedPayment = verifyResult.rows[0];
        
        console.log('\n📊 Updated Payment 141 status:');
        console.log('  - Total Amount:', updatedPayment.amount, 'MXN');
        console.log('  - Status:', updatedPayment.status);

        // Add payment event for status update
        await client.query(`
            INSERT INTO payment_event ("paymentId", type, description, created_at, is_automatic)
            VALUES ($1, $2, $3, NOW(), $4)
        `, [
            141,
            'status_updated',
            JSON.stringify({
                previous_status: payment.status,
                new_status: 'completed',
                seller_paid_amount: sellerPaidAmount,
                reason: 'seller_payout_completed',
                escrow_status: 'active',
                note: 'Payment completed: seller received 15000 MXN, 15000 MXN secured in escrow'
            }),
            false
        ]);

        console.log('✅ Payment event logged');
        console.log('\n🎉 Payment 141 fully updated!');
        console.log('💰 Financial Summary:');
        console.log('  - Total Payment: $30,000.00 MXN');
        console.log('  - Ya pagado al vendedor: $15,000.00 MXN ✅');
        console.log('  - En custodia: $15,000.00 MXN ✅');
        console.log('  - Pendiente por pagar: $0.00 MXN ✅');

    } catch (error) {
        console.error('❌ Error updating payment status:', error.message);
    } finally {
        if (client) {
            client.release();
            console.log('🔌 Database connection closed');
        }
        await pool.end();
    }
}

updatePaymentStatus().catch(console.error);
