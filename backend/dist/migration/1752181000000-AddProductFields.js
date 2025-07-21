"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProductFields1752181000000 = void 0;
const typeorm_1 = require("typeorm");
class AddProductFields1752181000000 {
    constructor() {
        this.name = 'AddProductFields1752181000000';
    }
    async up(queryRunner) {
        // Add transaction subtype field
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "transaction_subtype",
            type: "text",
            isNullable: true,
            comment: "Transaction subtype: Apartado, Enganche, Compraventa"
        }));
        // Add operation_type if it doesn't exist (some may have this already)
        const table = await queryRunner.getTable("payment");
        const operationTypeColumn = table?.findColumnByName("operation_type");
        if (!operationTypeColumn) {
            await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
                name: "operation_type",
                type: "varchar",
                length: "50",
                isNullable: true,
                comment: "Operation type: Enganche, Apartado, Renta, Compra-venta"
            }));
        }
        // Add vehicle-specific fields
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_brand",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_model",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_year",
            type: "integer",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_vin",
            type: "varchar",
            length: "17",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_mileage",
            type: "integer",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "vehicle_condition",
            type: "varchar",
            length: "50",
            isNullable: true
        }));
        // Add electronics-specific fields
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "electronics_brand",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "electronics_model",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "electronics_condition",
            type: "varchar",
            length: "50",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "electronics_warranty",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "electronics_serial",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        // Add appliances-specific fields
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_type",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_brand",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_years_use",
            type: "integer",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_efficiency",
            type: "varchar",
            length: "50",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_condition",
            type: "varchar",
            length: "50",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "appliance_serial",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        // Add furniture-specific fields (no serial number - not realistic)
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "furniture_type",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "furniture_material",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "furniture_dimensions",
            type: "varchar",
            length: "100",
            isNullable: true
        }));
        await queryRunner.addColumn("payment", new typeorm_1.TableColumn({
            name: "furniture_condition",
            type: "varchar",
            length: "50",
            isNullable: true
        }));
    }
    async down(queryRunner) {
        // Remove all product-specific fields in reverse order
        await queryRunner.dropColumn("payment", "furniture_condition");
        await queryRunner.dropColumn("payment", "furniture_dimensions");
        await queryRunner.dropColumn("payment", "furniture_material");
        await queryRunner.dropColumn("payment", "furniture_type");
        await queryRunner.dropColumn("payment", "appliance_serial");
        await queryRunner.dropColumn("payment", "appliance_condition");
        await queryRunner.dropColumn("payment", "appliance_efficiency");
        await queryRunner.dropColumn("payment", "appliance_years_use");
        await queryRunner.dropColumn("payment", "appliance_brand");
        await queryRunner.dropColumn("payment", "appliance_type");
        await queryRunner.dropColumn("payment", "electronics_serial");
        await queryRunner.dropColumn("payment", "electronics_warranty");
        await queryRunner.dropColumn("payment", "electronics_condition");
        await queryRunner.dropColumn("payment", "electronics_model");
        await queryRunner.dropColumn("payment", "electronics_brand");
        await queryRunner.dropColumn("payment", "vehicle_condition");
        await queryRunner.dropColumn("payment", "vehicle_mileage");
        await queryRunner.dropColumn("payment", "vehicle_vin");
        await queryRunner.dropColumn("payment", "vehicle_year");
        await queryRunner.dropColumn("payment", "vehicle_model");
        await queryRunner.dropColumn("payment", "vehicle_brand");
        await queryRunner.dropColumn("payment", "transaction_subtype");
        // Only drop operation_type if we added it (check if it exists)
        const table = await queryRunner.getTable("payment");
        const operationTypeColumn = table?.findColumnByName("operation_type");
        if (operationTypeColumn) {
            await queryRunner.dropColumn("payment", "operation_type");
        }
    }
}
exports.AddProductFields1752181000000 = AddProductFields1752181000000;
