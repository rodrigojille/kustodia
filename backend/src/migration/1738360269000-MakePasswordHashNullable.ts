class MakePasswordHashNullable1738360269000 {
    name = 'MakePasswordHashNullable1738360269000';

    async up(queryRunner: any) {
        // Make password_hash column nullable to support Google OAuth users
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password_hash" DROP NOT NULL`);
    }

    async down(queryRunner: any) {
        // Revert: Make password_hash column NOT NULL again
        // Note: This will fail if there are users with NULL password_hash
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password_hash" SET NOT NULL`);
    }
}

module.exports = { MakePasswordHashNullable1738360269000 };
