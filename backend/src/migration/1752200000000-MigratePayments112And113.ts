import { MigrationInterface, QueryRunner } from "typeorm";

export class MigratePayments112And1131752200000000 implements MigrationInterface {
    name = 'MigratePayments112And1131752200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🚀 Starting migration for payments 112 and 113...');

        // Check current status first
        console.log('📋 Checking current status...');
        const currentStatus = await queryRunner.query(`
            SELECT 
                p.id as payment_id,
                p.status as payment_status,
                p.payer_approval,
                p.payee_approval,
                e.status as escrow_status,
                e.release_tx_hash,
                e.smart_contract_escrow_id
            FROM payment p
            LEFT JOIN escrow e ON p.id = e.payment_id
            WHERE p.id IN (112, 113)
            ORDER BY p.id
        `);

        console.log('Current status:', currentStatus);

        // Migration for Payment 112
        console.log('🔄 Migrating Payment 112...');
        
        // Update payment 112
        await queryRunner.query(`
            UPDATE payment 
            SET 
                status = 'completed',
                payer_approval = true,
                payee_approval = true,
                updated_at = NOW()
            WHERE id = 112
        `);

        // Update escrow for payment 112
        await queryRunner.query(`
            UPDATE escrow 
            SET 
                status = 'completed',
                release_tx_hash = '0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d',
                smart_contract_escrow_id = '9',
                updated_at = NOW()
            WHERE payment_id = 112
        `);

        // Add migration event for payment 112
        await queryRunner.query(`
            INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
            VALUES (
                112,
                'production_migration',
                'Estado migrado desde desarrollo - Payment 112 completado con custodia liberada (TX: 0x1917e76262e46cd27aa80cf702e1ae204f0c37936ce9c45e115298ac4e1cd35d)',
                true,
                NOW()
            )
        `);

        console.log('✅ Payment 112 migrated successfully');

        // Migration for Payment 113
        console.log('🔄 Migrating Payment 113...');
        
        // Update payment 113
        await queryRunner.query(`
            UPDATE payment 
            SET 
                status = 'completed',
                payer_approval = true,
                payee_approval = true,
                updated_at = NOW()
            WHERE id = 113
        `);

        // Update escrow for payment 113
        await queryRunner.query(`
            UPDATE escrow 
            SET 
                status = 'completed',
                release_tx_hash = '0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531',
                smart_contract_escrow_id = '10',
                updated_at = NOW()
            WHERE payment_id = 113
        `);

        // Add migration event for payment 113
        await queryRunner.query(`
            INSERT INTO payment_event (payment_id, type, description, is_automatic, created_at)
            VALUES (
                113,
                'production_migration',
                'Estado migrado desde desarrollo - Payment 113 completado con custodia liberada (TX: 0x41da5b7d6b5f08596c04c798409723e20361acd25430b0f058b7e6970fa38531)',
                true,
                NOW()
            )
        `);

        console.log('✅ Payment 113 migrated successfully');

        // Verify final status
        console.log('🔍 Verifying migration results...');
        const finalStatus = await queryRunner.query(`
            SELECT 
                p.id as payment_id,
                p.status as payment_status,
                p.payer_approval,
                p.payee_approval,
                e.status as escrow_status,
                CASE 
                    WHEN e.release_tx_hash IS NOT NULL THEN 'YES' 
                    ELSE 'NO' 
                END as has_release_tx,
                e.smart_contract_escrow_id
            FROM payment p
            LEFT JOIN escrow e ON p.id = e.payment_id
            WHERE p.id IN (112, 113)
            ORDER BY p.id
        `);

        console.log('Final status:', finalStatus);
        console.log('🎉 Migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️  Rolling back migration for payments 112 and 113...');

        // Rollback Payment 112
        await queryRunner.query(`
            UPDATE payment 
            SET 
                status = 'escrowed',
                payer_approval = false,
                payee_approval = false,
                updated_at = NOW()
            WHERE id = 112
        `);

        await queryRunner.query(`
            UPDATE escrow 
            SET 
                status = 'active',
                release_tx_hash = NULL,
                updated_at = NOW()
            WHERE payment_id = 112
        `);

        // Rollback Payment 113
        await queryRunner.query(`
            UPDATE payment 
            SET 
                status = 'escrowed',
                payer_approval = false,
                payee_approval = false,
                updated_at = NOW()
            WHERE id = 113
        `);

        await queryRunner.query(`
            UPDATE escrow 
            SET 
                status = 'active',
                release_tx_hash = NULL,
                updated_at = NOW()
            WHERE payment_id = 113
        `);

        // Remove migration events
        await queryRunner.query(`
            DELETE FROM payment_event 
            WHERE payment_id IN (112, 113) 
            AND type = 'production_migration'
        `);

        console.log('✅ Rollback completed');
    }
}
