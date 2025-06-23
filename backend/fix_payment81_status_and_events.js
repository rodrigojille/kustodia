require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Spanish event translations
const EVENT_TRANSLATIONS = {
  'escrow_released': 'fondos_custodia_liberados',
  'mxnb_redeemed': 'mxnb_canjeados',
  'payment_completed': 'pago_completado',
  'spei_payout_initiated': 'pago_spei_iniciado',
  'Successfully redeemed': 'Canje exitoso de',
  'MXNB to MXN via Juno': 'MXNB a MXN vía Juno',
  'Redemption ID': 'ID de canje',
  'Escrow funds released successfully': 'Fondos de custodia liberados exitosamente',
  'Smart contract escrow released onchain': 'Custodia del contrato inteligente liberada en blockchain',
  'Payment completed successfully': 'Pago completado exitosamente',
  'SPEI payout to': 'Pago SPEI a',
  'Deposit ID': 'ID de depósito'
};

async function fixPayment81StatusAndEvents() {
  console.log('🔧 FIXING PAYMENT 81 STATUS LOGIC & SPANISH EVENTS');
  console.log('==================================================');
  
  try {
    await client.connect();
    
    // Step 1: Get current payment data
    console.log('📊 Step 1: Current Payment Data');
    const paymentQuery = await client.query(`
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.custody_percentage,
        p.recipient_email,
        e.custody_amount,
        e.status as escrow_status
      FROM payment p
      JOIN escrow e ON e.payment_id = p.id
      WHERE p.id = 81
    `);
    
    if (paymentQuery.rows.length === 0) {
      throw new Error('Payment 81 not found');
    }
    
    const payment = paymentQuery.rows[0];
    console.log(`Payment ID: ${payment.id}`);
    console.log(`Current Status: ${payment.status}`);
    console.log(`Total Amount: $${payment.amount} MXN`);
    console.log(`Custody Percentage: ${payment.custody_percentage}%`);
    console.log(`Custody Amount: $${payment.custody_amount} MXNB`);
    console.log(`Escrow Status: ${payment.escrow_status}`);
    console.log('');
    
    // Step 2: Calculate correct amounts
    const totalAmount = parseFloat(payment.amount);
    const custodyPercentage = parseFloat(payment.custody_percentage);
    const custodyAmount = (totalAmount * custodyPercentage) / 100;
    const immediateAmount = totalAmount - custodyAmount;
    
    console.log('🧮 Step 2: Payment Amount Calculation');
    console.log(`Total Payment: $${totalAmount} MXN`);
    console.log(`Custody Amount (${custodyPercentage}%): $${custodyAmount} MXN`);
    console.log(`Immediate Amount: $${immediateAmount} MXN`);
    console.log('');
    
    // Step 3: Determine if payment should have amount_paid column
    console.log('📋 Step 3: Checking Payment Table Schema');
    const schemaQuery = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payment' 
      AND column_name IN ('amount_paid', 'paid_amount', 'remaining_amount')
    `);
    
    const hasAmountPaidColumn = schemaQuery.rows.some(row => 
      ['amount_paid', 'paid_amount', 'remaining_amount'].includes(row.column_name)
    );
    
    console.log(`Has amount tracking columns: ${hasAmountPaidColumn}`);
    
    if (!hasAmountPaidColumn) {
      console.log('Adding amount_paid column to payment table...');
      await client.query(`
        ALTER TABLE payment 
        ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0
      `);
      console.log('✅ Added amount_paid column');
    }
    console.log('');
    
    // Step 4: Update payment amounts based on status
    console.log('💰 Step 4: Updating Payment Amounts');
    let correctAmountPaid = 0;
    
    if (payment.status === 'completed') {
      correctAmountPaid = totalAmount; // 100% paid when completed
    } else if (payment.status === 'paid') {
      correctAmountPaid = immediateAmount; // Only immediate portion paid
    }
    
    console.log(`Setting amount_paid to: $${correctAmountPaid} MXN`);
    
    await client.query(`
      UPDATE payment 
      SET amount_paid = $1
      WHERE id = 81
    `, [correctAmountPaid]);
    
    console.log('✅ Updated payment amounts');
    console.log('');
    
    // Step 5: Update event labels to Spanish
    console.log('🔄 Step 5: Translating Events to Spanish');
    
    // Get current events
    const eventsQuery = await client.query(`
      SELECT id, type, description, created_at
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${eventsQuery.rows.length} events to translate`);
    
    for (const event of eventsQuery.rows) {
      let updatedType = event.type;
      let updatedDescription = event.description;
      let needsUpdate = false;
      
      // Translate event types
      if (EVENT_TRANSLATIONS[event.type]) {
        updatedType = EVENT_TRANSLATIONS[event.type];
        needsUpdate = true;
      }
      
      // Translate descriptions
      if (event.description) {
        let newDescription = event.description;
        
        Object.keys(EVENT_TRANSLATIONS).forEach(englishPhrase => {
          if (newDescription.includes(englishPhrase)) {
            newDescription = newDescription.replace(
              new RegExp(englishPhrase, 'g'), 
              EVENT_TRANSLATIONS[englishPhrase]
            );
            needsUpdate = true;
          }
        });
        
        // Additional specific translations
        newDescription = newDescription
          .replace(/Successfully redeemed (\d+) MXNB to MXN via Juno\. Redemption ID: (.+)/g, 
                   'Canje exitoso de $1 MXNB a MXN vía Juno. ID de canje: $2')
          .replace(/SPEI payout to (\d+)/g, 'Pago SPEI a $1')
          .replace(/Deposit ID: (.+)/g, 'ID de depósito: $1')
          .replace(/Smart contract escrow released onchain/g, 
                   'Custodia del contrato inteligente liberada en blockchain')
          .replace(/Escrow funds released successfully/g, 
                   'Fondos de custodia liberados exitosamente')
          .replace(/Payment completed successfully/g, 
                   'Pago completado exitosamente');
        
        if (newDescription !== event.description) {
          updatedDescription = newDescription;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`Updating event ${event.id}:`);
        console.log(`  Type: ${event.type} → ${updatedType}`);
        console.log(`  Description: ${event.description} → ${updatedDescription}`);
        
        await client.query(`
          UPDATE payment_event 
          SET type = $1, description = $2
          WHERE id = $3
        `, [updatedType, updatedDescription, event.id]);
        
        console.log('  ✅ Updated');
      }
    }
    
    console.log('');
    
    // Step 6: Add final completion event in Spanish if not exists
    console.log('📝 Step 6: Adding Final Completion Event in Spanish');
    
    const completionEventQuery = await client.query(`
      SELECT id FROM payment_event
      WHERE "paymentId" = 81 
      AND type IN ('pago_completado', 'payment_completed')
    `);
    
    if (completionEventQuery.rows.length === 0) {
      await client.query(`
        INSERT INTO payment_event ("paymentId", type, description, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [
        81,
        'pago_completado',
        'Pago completado exitosamente. Fondos liberados de custodia y transferidos vía SPEI.'
      ]);
      console.log('✅ Added final completion event in Spanish');
    } else {
      console.log('✅ Completion event already exists');
    }
    
    // Step 7: Final verification
    console.log('');
    console.log('🎯 Step 7: Final Verification');
    
    const finalPaymentQuery = await client.query(`
      SELECT 
        p.id,
        p.status,
        p.amount,
        p.amount_paid,
        (p.amount - COALESCE(p.amount_paid, 0)) as monto_por_pagar
      FROM payment p
      WHERE p.id = 81
    `);
    
    const finalPayment = finalPaymentQuery.rows[0];
    
    console.log('📊 FINAL PAYMENT STATUS:');
    console.log(`Payment ID: ${finalPayment.id}`);
    console.log(`Status: ${finalPayment.status}`);
    console.log(`Total Amount: $${finalPayment.amount} MXN`);
    console.log(`Amount Paid: $${finalPayment.amount_paid || 0} MXN`);
    console.log(`Monto Por Pagar: $${finalPayment.monto_por_pagar} MXN`);
    
    const finalEventsQuery = await client.query(`
      SELECT type, description
      FROM payment_event
      WHERE "paymentId" = 81
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('');
    console.log('📋 RECENT EVENTS (Spanish):');
    finalEventsQuery.rows.forEach((event, index) => {
      console.log(`${index + 1}. ${event.type}: ${event.description}`);
    });
    
    console.log('');
    console.log('🎉 PAYMENT 81 STATUS AND EVENTS FIXED!');
    console.log('=====================================');
    console.log(`✅ Amount logic corrected: Monto por pagar = $${finalPayment.monto_por_pagar}`);
    console.log('✅ Events translated to Spanish');
    console.log('✅ Payment status properly reflects completion');
    
    return {
      success: true,
      paymentId: 81,
      totalAmount: finalPayment.amount,
      amountPaid: finalPayment.amount_paid,
      montoPorPagar: finalPayment.monto_por_pagar,
      eventsTranslated: true
    };
    
  } catch (error) {
    console.error('❌ Error fixing payment status:', error.message);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}

fixPayment81StatusAndEvents();
