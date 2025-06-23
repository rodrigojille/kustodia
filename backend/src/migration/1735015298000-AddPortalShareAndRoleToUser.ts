import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPortalShareAndRoleToUser1735015298000 implements MigrationInterface {
    name = 'AddPortalShareAndRoleToUser1735015298000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_share" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_share"`);
    }
}
