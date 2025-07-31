import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateBlacklistTable1706789200000 implements MigrationInterface {
    name = 'CreateBlacklistTable1706789200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "blacklist",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["user", "wallet_address", "email", "ip_address"],
                    },
                    {
                        name: "identifier",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "reason",
                        type: "enum",
                        enum: [
                            "money_laundering",
                            "fraud",
                            "suspicious_activity",
                            "regulatory_request",
                            "sanctions",
                            "high_risk_jurisdiction",
                            "manual_review",
                            "other"
                        ],
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["active", "inactive", "under_review"],
                        default: "'active'",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "reference_number",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "source",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "added_by_user_id",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "reviewed_by_user_id",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "review_date",
                        type: "datetime",
                        isNullable: true,
                    },
                    {
                        name: "review_notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "expiry_date",
                        type: "datetime",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create indexes for performance
        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_TYPE_IDENTIFIER",
                columnNames: ["type", "identifier"]
            })
        );

        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_STATUS",
                columnNames: ["status"]
            })
        );

        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_IDENTIFIER",
                columnNames: ["identifier"]
            })
        );

        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_REASON",
                columnNames: ["reason"]
            })
        );

        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_EXPIRY",
                columnNames: ["expiry_date"]
            })
        );

        await queryRunner.createIndex(
            "blacklist",
            new TableIndex({
                name: "IDX_BLACKLIST_CREATED_AT",
                columnNames: ["created_at"]
            })
        );

        // Create foreign key constraints
        await queryRunner.createForeignKey(
            "blacklist",
            new TableForeignKey({
                name: "FK_BLACKLIST_ADDED_BY_USER",
                columnNames: ["added_by_user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "blacklist",
            new TableForeignKey({
                name: "FK_BLACKLIST_REVIEWED_BY_USER",
                columnNames: ["reviewed_by_user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const table = await queryRunner.getTable("blacklist");
        if (table) {
            const addedByForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("added_by_user_id") !== -1);
            const reviewedByForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("reviewed_by_user_id") !== -1);
            
            if (addedByForeignKey) {
                await queryRunner.dropForeignKey("blacklist", addedByForeignKey);
            }
            
            if (reviewedByForeignKey) {
                await queryRunner.dropForeignKey("blacklist", reviewedByForeignKey);
            }
        }

        // Drop indexes
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_TYPE_IDENTIFIER");
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_STATUS");
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_IDENTIFIER");
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_REASON");
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_EXPIRY");
        await queryRunner.dropIndex("blacklist", "IDX_BLACKLIST_CREATED_AT");

        // Drop table
        await queryRunner.dropTable("blacklist");
    }
}
