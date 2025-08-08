class UpdatePortalShareToText1737693000000 {
    name = 'UpdatePortalShareToText1737693000000';

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "portal_share" TYPE text`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "portal_share" TYPE varchar(128)`);
    }
}

module.exports = { UpdatePortalShareToText1737693000000 };
