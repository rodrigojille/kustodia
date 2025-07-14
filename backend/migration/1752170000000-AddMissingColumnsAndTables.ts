import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumnsAndTables1752170000000 implements MigrationInterface {
    name = 'AddMissingColumnsAndTables1752170000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add missing columns to user table
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleAccessToken" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "googleRefreshToken" text`);

        // Add missing column to payment table
        await queryRunner.query(`ALTER TABLE "payment" ADD COLUMN IF NOT EXISTS "payout_juno_bank_account_id" varchar(255)`);

        // Create notification table if it doesn't exist
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "notification" (
            "id" SERIAL NOT NULL,
            "message" varchar(500) NOT NULL,
            "link" varchar(255),
            "type" varchar(50) NOT NULL DEFAULT 'info',
            "category" varchar(50) NOT NULL DEFAULT 'general',
            "read" boolean NOT NULL DEFAULT false,
            "payment_id" integer,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "user_id" integer,
            CONSTRAINT "PK_notification" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints for notification table
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_payment" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Create other missing tables if they don't exist
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ticket" (
            "id" SERIAL NOT NULL,
            "subject" varchar(255) NOT NULL,
            "description" text NOT NULL,
            "status" varchar(50) NOT NULL DEFAULT 'open',
            "priority" varchar(50) NOT NULL DEFAULT 'medium',
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "user_id" integer,
            CONSTRAINT "PK_ticket" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "ticket_reply" (
            "id" SERIAL NOT NULL,
            "message" text NOT NULL,
            "is_admin_reply" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "ticket_id" integer,
            "user_id" integer,
            CONSTRAINT "PK_ticket_reply" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "dispute" (
            "id" SERIAL NOT NULL,
            "reason" varchar(255) NOT NULL,
            "description" text NOT NULL,
            "status" varchar(50) NOT NULL DEFAULT 'open',
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "payment_id" integer,
            "initiated_by_user_id" integer,
            CONSTRAINT "PK_dispute" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "dispute_message" (
            "id" SERIAL NOT NULL,
            "message" text NOT NULL,
            "is_admin_message" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "dispute_id" integer,
            "user_id" integer,
            CONSTRAINT "PK_dispute_message" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_ticket_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_reply" ADD CONSTRAINT "FK_ticket_reply_ticket" FOREIGN KEY ("ticket_id") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_reply" ADD CONSTRAINT "FK_ticket_reply_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute" ADD CONSTRAINT "FK_dispute_payment" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute" ADD CONSTRAINT "FK_dispute_user" FOREIGN KEY ("initiated_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute_message" ADD CONSTRAINT "FK_dispute_message_dispute" FOREIGN KEY ("dispute_id") REFERENCES "dispute"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute_message" ADD CONSTRAINT "FK_dispute_message_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "dispute_message" DROP CONSTRAINT IF EXISTS "FK_dispute_message_user"`);
        await queryRunner.query(`ALTER TABLE "dispute_message" DROP CONSTRAINT IF EXISTS "FK_dispute_message_dispute"`);
        await queryRunner.query(`ALTER TABLE "dispute" DROP CONSTRAINT IF EXISTS "FK_dispute_user"`);
        await queryRunner.query(`ALTER TABLE "dispute" DROP CONSTRAINT IF EXISTS "FK_dispute_payment"`);
        await queryRunner.query(`ALTER TABLE "ticket_reply" DROP CONSTRAINT IF EXISTS "FK_ticket_reply_user"`);
        await queryRunner.query(`ALTER TABLE "ticket_reply" DROP CONSTRAINT IF EXISTS "FK_ticket_reply_ticket"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_user"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "FK_notification_payment"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT IF EXISTS "FK_notification_user"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "dispute_message"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "dispute"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticket_reply"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticket"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification"`);

        // Remove columns
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN IF EXISTS "payout_juno_bank_account_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleAccessToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "googleId"`);
    }
}
