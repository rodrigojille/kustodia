"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddGoogleSSOFields1752168067827 = void 0;
class AddGoogleSSOFields1752168067827 {
    constructor() {
        this.name = 'AddGoogleSSOFields1752168067827';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "googleId" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "googleAccessToken" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "googleRefreshToken" text`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_client_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_client_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_share"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_share" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_share"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_share" text`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_client_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_client_id" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "googleRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "googleAccessToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_470355432cc67b2c470c30bef7c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "googleId"`);
    }
}
exports.AddGoogleSSOFields1752168067827 = AddGoogleSSOFields1752168067827;
