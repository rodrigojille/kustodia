import "reflect-metadata";
import { AppDataSource } from "./src/data-source";
import { Payment } from "./src/entity/Payment";
import { Escrow } from "./src/entity/Escrow";
import { PaymentEvent } from "./src/entity/PaymentEvent";
import { redeemMXNbForMXN, sendJunoPayment } from "./src/services/junoService";

/**
 * Manual completion script for Payment 83
 * Completes the missing steps: MXNB redemption + SPEI payout + status update
 */
async function completePayment83Manual() {
  await AppDataSource.initialize();
  
  const paymentRepo = AppDataSource.getRepository(Payment);
  const escrowRepo = AppDataSource.getRepository(Escrow);
  const eventRepo = AppDataSource.getRepository(PaymentEvent);

  try {
    console.log('🔧 MANUAL COMPLETION: Payment 83');
    console.log('Current time:', new Date().toISOString());
    console.log('');

    // Get payment and escrow
    const payment = await paymentRepo.findOne({
      where: { id: 83 },
      relations: ['user', 'escrow']
    });

    if (!payment) {
      console.log('❌ Payment 83 not found');
      return;
    }

    const escrow = await escrowRepo.findOne({
      where: { paymentId: 83 }
    });

    if (!escrow) {
      console.log('❌ Escrow for payment 83 not found');
      return;
    }

    console.log('📊 CURRENT STATUS:');
    console.log('Payment Status:', payment.status);
    console.log('Escrow Status:', escrow.status);
    console.log('Amount:', payment.amount, payment.currency);
    console.log('Payout CLABE:', payment.payout_clabe);
    console.log('');

    // Check if escrow is released
    if (escrow.status !== 'released') {
      console.log('❌ Escrow is not released yet. Current status:', escrow.status);
      return;
    }

    console.log('✅ Escrow is released. Proceeding with redemption...');
    console.log('');

    // Step 1: Redeem MXNB to MXN via Juno
    console.log('🔄 Step 1: Redeeming MXNB to MXN via Juno API...');
    try {
      const redemptionResult = await redeemMXNbForMXN(payment.amount);
      console.log('✅ MXNB redemption successful:', redemptionResult);
      
      // Log event
      const redemptionEvent = eventRepo.create({
        paymentId: payment.id,
        type: 'mxnb_redemption',
        description: `MXNB redeemed to MXN: ${payment.amount}`
      });
      await eventRepo.save(redemptionEvent);
    } catch (error) {
      console.error('❌ MXNB redemption failed:', error);
      return;
    }

    // Step 2: Send SPEI payment to recipient
    console.log('🔄 Step 2: Sending SPEI payment to recipient...');
    try {
      const speiResult = await sendJunoPayment(
        payment.payout_clabe,
        payment.amount,
        `Pago Kustodia - ${payment.id}`
      );
      console.log('✅ SPEI payment successful:', speiResult);
      
      // Log event
      const speiEvent = eventRepo.create({
        paymentId: payment.id,
        type: 'spei_sent',
        description: `SPEI sent to ${payment.payout_clabe}: ${payment.amount} MXN`
      });
      await eventRepo.save(speiEvent);
    } catch (error) {
      console.error('❌ SPEI payment failed:', error);
      return;
    }

    // Step 3: Update payment and escrow status
    console.log('🔄 Step 3: Updating payment status to completed...');
    payment.status = 'completed';
    escrow.status = 'completed';
    
    await paymentRepo.save(payment);
    await escrowRepo.save(escrow);

    // Log completion event
    const completionEvent = eventRepo.create({
      paymentId: payment.id,
      type: 'payment_completed',
      description: 'Payment manually completed - MXNB redeemed and SPEI sent'
    });
    await eventRepo.save(completionEvent);

    console.log('');
    console.log('🎉 SUCCESS: Payment 83 manually completed!');
    console.log('✅ MXNB redeemed to MXN');
    console.log('✅ SPEI sent to recipient CLABE:', payment.payout_clabe);
    console.log('✅ Payment status updated to: completed');
    console.log('✅ Escrow status updated to: completed');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Verify SPEI transfer in Juno dashboard');
    console.log('2. Check recipient received funds');
    console.log('3. Fix automation to prevent future gaps');

  } catch (error) {
    console.error('❌ Fatal error during manual completion:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

completePayment83Manual().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
