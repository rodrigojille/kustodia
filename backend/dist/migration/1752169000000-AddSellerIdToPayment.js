"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissingColumns1752169000000 = void 0;
const typeorm_1 = require("typeorm");
class AddMissingColumns1752169000000 {
    constructor() {
        this.name = 'AddMissingColumns1752169000000';
    }
    async up(queryRunner) {
        console.log("🔧 Adding missing columns to production database...");
        // Check and add seller_id column to payment table
        const paymentTable = await queryRunner.getTable("payment");
        if (paymentTable) {
            const sellerIdColumn = paymentTable.findColumnByName("seller_id");
            if (!sellerIdColumn) {
                console.log("Adding seller_id column to payment table...");
                await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
                    name: "seller_id",
                    type: "integer",
                    isNullable: true
                }));
                await queryRunner.createForeignKey("payment", new typeorm_1.TableForeignKey({
                    columnNames: ["seller_id"],
                    referencedColumnNames: ["id"],
                    referencedTableName: "user",
                    onDelete: "SET NULL"
                }));
                console.log("✅ seller_id column added successfully");
            }
            else {
                console.log("✅ seller_id column already exists");
            }
        }
        // Check and add portal_client_id column to user table
        const userTable = await queryRunner.getTable("user");
        if (userTable) {
            const portalClientIdColumn = userTable.findColumnByName("portal_client_id");
            if (!portalClientIdColumn) {
                console.log("Adding portal_client_id column to user table...");
                await queryRunner.addColumn("user", new typeorm_1.TableColumn({
                    name: "portal_client_id",
                    type: "varchar",
                    length: "255",
                    isNullable: true
                }));
                console.log("✅ portal_client_id column added successfully");
            }
            else {
                console.log("✅ portal_client_id column already exists");
            }
            // Check and add portal_share column to user table
            const portalShareColumn = userTable.findColumnByName("portal_share");
            if (!portalShareColumn) {
                console.log("Adding portal_share column to user table...");
                await queryRunner.addColumn("user", new typeorm_1.TableColumn({
                    name: "portal_share",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    isNullable: true
                }));
                console.log("✅ portal_share column added successfully");
            }
            else {
                console.log("✅ portal_share column already exists");
            }
        }
        console.log("🎉 All missing columns have been added!");
    }
    async down(queryRunner) {
        console.log("🗑️ Removing added columns...");
        // Remove seller_id from payment table
        const paymentTable = await queryRunner.getTable("payment");
        if (paymentTable) {
            const foreignKey = paymentTable.foreignKeys.find(fk => fk.columnNames.indexOf("seller_id") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("payment", foreignKey);
            }
            await queryRunner.dropColumn("payment", "seller_id");
        }
        // Remove portal columns from user table
        const userTable = await queryRunner.getTable("user");
        if (userTable) {
            await queryRunner.dropColumn("user", "portal_client_id");
            await queryRunner.dropColumn("user", "portal_share");
        }
        console.log("✅ Columns removed successfully");
    }
}
exports.AddMissingColumns1752169000000 = AddMissingColumns1752169000000;
