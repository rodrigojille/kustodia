import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePortalShareToText1737693000000 implements MigrationInterface {
    name = 'UpdatePortalShareToText1737693000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "portal_share" TYPE text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "portal_share" TYPE varchar(128)`);
    }
}
