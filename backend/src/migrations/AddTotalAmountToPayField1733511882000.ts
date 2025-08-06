import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTotalAmountToPayField1733511882000 implements MigrationInterface {
    name = 'AddTotalAmountToPayField1733511882000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("payment", new TableColumn({
            name: "total_amount_to_pay",
            type: "decimal",
            precision: 18,
            scale: 2,
            isNullable: true,
            comment: "Base amount + platform commission (what user actually pays)"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("payment", "total_amount_to_pay");
    }
}
