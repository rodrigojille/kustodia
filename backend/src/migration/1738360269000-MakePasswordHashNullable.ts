import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePasswordHashNullable1738360269000 implements MigrationInterface {
    name = 'MakePasswordHashNullable1738360269000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make password_hash column nullable to support Google OAuth users
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password_hash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: Make password_hash column NOT NULL again
        // Note: This will fail if there are users with NULL password_hash
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password_hash" SET NOT NULL`);
    }
}
