import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPaymentAutomationStateFields1723167600000 implements MigrationInterface {
    name = 'AddPaymentAutomationStateFields1723167600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add automation state tracking fields to Payment table
        await queryRunner.addColumns("payment", [
            new TableColumn({
                name: "automation_state",
                type: "varchar",
                length: "50",
                isNullable: true,
                comment: "Payment automation state: deposit_detected | withdrawal_pending | withdrawal_complete | escrow_pending | escrow_complete"
            }),
            new TableColumn({
                name: "withdrawal_status",
                type: "varchar",
                length: "20",
                isNullable: true,
                comment: "Juno withdrawal status: pending | completed | failed | verified"
            }),
            new TableColumn({
                name: "withdrawal_id",
                type: "varchar",
                length: "255",
                isNullable: true,
                comment: "Juno withdrawal ID for idempotency checking"
            }),
            new TableColumn({
                name: "escrow_creation_locked",
                type: "boolean",
                isNullable: true,
                default: false,
                comment: "Prevents parallel escrow creation attempts"
            }),
            new TableColumn({
                name: "escrow_lock_expires_at",
                type: "timestamp",
                isNullable: true,
                comment: "Escrow creation lock expiration timestamp"
            })
        ]);

        console.log("✅ Added payment automation state tracking fields");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the automation state fields
        await queryRunner.dropColumns("payment", [
            "automation_state",
            "withdrawal_status", 
            "withdrawal_id",
            "escrow_creation_locked",
            "escrow_lock_expires_at"
        ]);

        console.log("✅ Removed payment automation state tracking fields");
    }
}
