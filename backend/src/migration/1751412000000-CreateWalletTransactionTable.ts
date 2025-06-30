import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateWalletTransactionTable1751412000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "wallet_transaction",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "user_id",
                    type: "int",
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["DEPOSIT", "WITHDRAWAL"],
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending_deposit", "pending_juno_withdrawal", "pending_bridge_transfer", "pending_blockchain_confirmation", "completed", "failed", "pending"],
                    default: "'pending'"
                },
                {
                    name: "amount_mxn",
                    type: "decimal",
                    precision: 18,
                    scale: 2,
                    isNullable: true,
                },
                {
                    name: "amount_mxnb",
                    type: "decimal",
                    precision: 18,
                    scale: 8,
                    isNullable: true,
                },
                {
                    name: "deposit_clabe",
                    type: "varchar",
                    isNullable: true,
                    isUnique: true,
                },
                {
                    name: "blockchain_tx_hash",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "juno_transaction_id",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()",
                    onUpdate: "now()",
                },
            ],
        }), true);

        await queryRunner.createForeignKey("wallet_transaction", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("wallet_transaction");
    }

}
