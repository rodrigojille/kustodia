"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ormconfig_1 = __importDefault(require("../ormconfig"));
const Payment_1 = require("../entity/Payment");
const Escrow_1 = require("../entity/Escrow");
const PaymentEvent_1 = require("../entity/PaymentEvent");
/**
 * Update legacy payments that were processed manually before automation
 * Specifically updates payments 71, 73 and any others that need status correction
 */
async function updateLegacyPaymentStatuses() {
    console.log('🔄 Iniciando actualización de pagos legacy...');
    await ormconfig_1.default.initialize();
    const paymentRepo = ormconfig_1.default.getRepository(Payment_1.Payment);
    const escrowRepo = ormconfig_1.default.getRepository(Escrow_1.Escrow);
    const paymentEventRepo = ormconfig_1.default.getRepository(PaymentEvent_1.PaymentEvent);
    // Define legacy payments to update
    const legacyPaymentUpdates = [
        {
            id: 71,
            newStatus: 'completed',
            reason: 'Custodia expirada y procesada manualmente antes de automatización'
        },
        {
            id: 73,
            newStatus: 'completed',
            reason: 'Procesado manualmente antes de automatización'
        }
    ];
    let updatedCount = 0;
    for (const update of legacyPaymentUpdates) {
        try {
            console.log(`\n📋 Procesando Payment ${update.id}...`);
            // Get payment with escrow relation
            const payment = await paymentRepo.findOne({
                where: { id: update.id },
                relations: ['escrow']
            });
            if (!payment) {
                console.log(`❌ Payment ${update.id} not found`);
                continue;
            }
            console.log(`   Actual status: ${payment.status}`);
            console.log(`   Target status: ${update.newStatus}`);
            // Update payment status
            const oldStatus = payment.status;
            payment.status = update.newStatus;
            await paymentRepo.save(payment);
            // Update escrow status if exists
            if (payment.escrow) {
                const escrow = payment.escrow;
                console.log(`   Escrow ${escrow.id} status: ${escrow.status} → completed`);
                escrow.status = 'completed';
                await escrowRepo.save(escrow);
            }
            // Log the status update event
            await paymentEventRepo.save(paymentEventRepo.create({
                paymentId: payment.id,
                type: 'status_actualizado_legacy',
                description: `Estado actualizado de '${oldStatus}' a '${update.newStatus}'. ${update.reason}`
            }));
            console.log(`✅ Payment ${update.id}: ${oldStatus} → ${update.newStatus}`);
            updatedCount++;
        }
        catch (error) {
            const errorMessage = error.message || 'Error desconocido';
            console.error(`❌ Error actualizando Payment ${update.id}:`, errorMessage);
            // Log error event
            try {
                await paymentEventRepo.save(paymentEventRepo.create({
                    paymentId: update.id,
                    type: 'error_actualizacion_legacy',
                    description: `Error actualizando estado legacy: ${errorMessage}`
                }));
            }
            catch (logError) {
                console.error(`❌ Error logging error event:`, logError);
            }
        }
    }
    console.log(`\n🎉 Actualización completada: ${updatedCount}/${legacyPaymentUpdates.length} pagos actualizados`);
    // Optional: Check for other potential legacy payments
    console.log('\n🔍 Buscando otros pagos potencialmente legacy...');
    const potentialLegacyPayments = await paymentRepo
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.escrow', 'escrow')
        .where('payment.status = :status', { status: 'paid' })
        .andWhere('escrow.custody_end < :now', { now: new Date() })
        .getMany();
    if (potentialLegacyPayments.length > 0) {
        console.log('\n⚠️ Pagos adicionales que podrían necesitar actualización:');
        for (const payment of potentialLegacyPayments) {
            console.log(`   Payment ${payment.id}: status='${payment.status}', custody_end=${payment.escrow?.custody_end}`);
        }
        console.log('\n💡 Considera agregar estos IDs al script si también son legacy');
    }
    else {
        console.log('✅ No se encontraron otros pagos legacy pendientes');
    }
    process.exit(0);
}
// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
    process.exit(1);
});
updateLegacyPaymentStatuses().catch(console.error);
