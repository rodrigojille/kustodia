"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPortalShareAndRoleToUser1735015298000 = void 0;
class AddPortalShareAndRoleToUser1735015298000 {
    constructor() {
        this.name = 'AddPortalShareAndRoleToUser1735015298000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "portal_share" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portal_share"`);
    }
}
exports.AddPortalShareAndRoleToUser1735015298000 = AddPortalShareAndRoleToUser1735015298000;
