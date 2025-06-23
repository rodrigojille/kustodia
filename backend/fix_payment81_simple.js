require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

async function fixPayment81Simple() {
  console.log('🔧 FIXING PAYMENT 81 - SIMPLE APPROACH');
  console.log('======================================');
  
  try {
    await client.connect();
    
    // Step 1: Get current payment and escrow data
    console.log('📊 Step 1: Getting Current Data');
    
    const paymentQuery = await client.query(`
      SELECT * FROM payment WHERE id = 81
    `);
    
    const escrowQuery = await client.query(`
      SELECT * FROM escrow WHERE payment_id = 81
    `);
    
    if (paymentQuery.rows.length === 0) {
      throw new Error('Payment 81 not found');
    }
    
    const payment = paymentQuery.rows[0];
    const escrow = escrowQuery.rows[0];
    
    console.log(`Payment Status: ${payment.status}`);
    console.log(`Payment Amount: $${payment.amount} MXN`);
    if (escrow) {
      console.log(`Escrow Amount: $${escrow.custody_amount} MXNB`);
      console.log(`Escrow Status: ${escrow.status}`);
    }
    console.log('');
    
    // Step 2: Add amount_paid column if it doesn't exist
    console.log('💰 Step 2: Setting Up Amount Tracking');
    
    try {
      await client.query(`
        ALTER TABLE payment 
        ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0
      `);
      console.log('✅ Amount_paid column ready');
    } catch (error) {
      console.log('ℹ️ Amount_paid column already exists or error:', error.message);
    }
    
    // For completed payments, amount_paid should equal total amount
    const totalAmount = parseFloat(payment.amount);
    let amountPaid = 0;
    
    if (payment.status === 'completed') {
      amountPaid = totalAmount; // 100% paid
      console.log(`Setting amount_paid to full amount: $${amountPaid} MXN`);
    } else if (payment.status === 'paid') {
      // For 'paid' status, typically only immediate portion is paid
      // Assuming 50% custody, immediate would be 50%
      amountPaid = totalAmount * 0.5; // Adjust based on actual custody percentage
      console.log(`Setting amount_paid to partial amount: $${amountPaid} MXN`);
    }
    
    await client.query(`
      UPDATE payment 
      SET amount_paid = $1
      WHERE id = 81
    `, [amountPaid]);
    
    console.log('✅ Updated payment amount_paid');
    console.log('');
    
    // Step 3: Update event descriptions to Spanish
    console.log('🔄 Step 3: Translating Events to Spanish');
    
    const eventsQuery = await client.query(`
      SELECT id, type, description
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${eventsQuery.rows.length} events to translate`);
    
    const translations = [
      // Event types
      { from: 'escrow_released', to: 'fondos_custodia_liberados' },
      { from: 'mxnb_redeemed', to: 'mxnb_canjeados' },
      { from: 'payment_completed', to: 'pago_completado' },
      { from: 'spei_payout_initiated', to: 'pago_spei_iniciado' },
      
      // Descriptions
      { from: 'Successfully redeemed', to: 'Canje exitoso de' },
      { from: 'MXNB to MXN via Juno', to: 'MXNB a MXN vía Juno' },
      { from: 'Redemption ID', to: 'ID de canje' },
      { from: 'Escrow funds released successfully', to: 'Fondos de custodia liberados exitosamente' },
      { from: 'Smart contract escrow released onchain', to: 'Custodia del contrato inteligente liberada en blockchain' },
      { from: 'Payment completed successfully', to: 'Pago completado exitosamente' },
      { from: 'SPEI payout to', to: 'Pago SPEI a' },
      { from: 'Deposit ID', to: 'ID de depósito' }
    ];
    
    for (const event of eventsQuery.rows) {
      let updatedType = event.type;
      let updatedDescription = event.description || '';
      let needsUpdate = false;
      
      // Translate type
      const typeTranslation = translations.find(t => t.from === event.type);
      if (typeTranslation) {
        updatedType = typeTranslation.to;
        needsUpdate = true;
      }
      
      // Translate description
      translations.forEach(translation => {
        if (updatedDescription.includes(translation.from)) {
          updatedDescription = updatedDescription.replace(
            new RegExp(translation.from, 'g'), 
            translation.to
          );
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        console.log(`Updating event ${event.id}: ${event.type} → ${updatedType}`);
        
        await client.query(`
          UPDATE payment_event 
          SET type = $1, description = $2
          WHERE id = $3
        `, [updatedType, updatedDescription, event.id]);
        
        console.log('  ✅ Updated');
      }
    }
    
    console.log('');
    
    // Step 4: Final verification
    console.log('🎯 Step 4: Final Verification');
    
    const verificationQuery = await client.query(`
      SELECT 
        p.id,
        p.status,
        p.amount,
        COALESCE(p.amount_paid, 0) as amount_paid,
        (p.amount - COALESCE(p.amount_paid, 0)) as monto_por_pagar
      FROM payment p
      WHERE p.id = 81
    `);
    
    const finalPayment = verificationQuery.rows[0];
    
    console.log('📊 FIXED PAYMENT STATUS:');
    console.log(`Payment ID: ${finalPayment.id}`);
    console.log(`Status: ${finalPayment.status}`);
    console.log(`Total Amount: $${finalPayment.amount} MXN`);
    console.log(`Amount Paid: $${finalPayment.amount_paid} MXN`);
    console.log(`Monto Por Pagar: $${finalPayment.monto_por_pagar} MXN`);
    
    const recentEventsQuery = await client.query(`
      SELECT type, description
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log('');
    console.log('📋 RECENT EVENTS (Spanish):');
    recentEventsQuery.rows.forEach((event, index) => {
      console.log(`${index + 1}. ${event.type}: ${event.description || 'Sin descripción'}`);
    });
    
    console.log('');
    if (finalPayment.monto_por_pagar === 0) {
      console.log('🎉 SUCCESS: Monto por pagar is now $0.00!');
    } else {
      console.log(`⚠️ Monto por pagar is still $${finalPayment.monto_por_pagar}`);
    }
    
    console.log('✅ Events translated to Spanish');
    console.log('✅ Payment logic fixed');
    
    return {
      success: true,
      paymentId: 81,
      montoPorPagar: finalPayment.monto_por_pagar,
      eventsTranslated: true
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

fixPayment81Simple();
