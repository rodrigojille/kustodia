import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMxnbBalanceToUser1751995645066 implements MigrationInterface {
    name = 'AddMxnbBalanceToUser1751995645066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_messages_message_type_enum') THEN
                    CREATE TYPE "public"."dispute_messages_message_type_enum" AS ENUM('initial', 'user_message', 'admin_message', 'evidence', 'system');
                END IF;
            END$$;
        `);
                await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "dispute_messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "message" text NOT NULL, 
                "message_type" "public"."dispute_messages_message_type_enum" NOT NULL DEFAULT 'user_message', 
                "attachment_url" character varying, 
                "attachment_name" character varying, 
                "attachment_type" character varying, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                "dispute_id" integer NOT NULL, 
                "user_id" integer NOT NULL, 
                "is_admin" boolean NOT NULL DEFAULT false, 
                CONSTRAINT "PK_8826f78d556a1846f8cbad5ed05" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "user" ADD "mxnb_balance" numeric(18,6) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payment_event" ALTER COLUMN "is_automatic" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" ADD CONSTRAINT "FK_69d15df0f67f230dd93be976214" FOREIGN KEY ("dispute_id") REFERENCES "dispute"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" ADD CONSTRAINT "FK_cacb4f37be925b033bc2752aab2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dispute_messages" DROP CONSTRAINT "FK_cacb4f37be925b033bc2752aab2"`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" DROP CONSTRAINT "FK_69d15df0f67f230dd93be976214"`);
        await queryRunner.query(`ALTER TABLE "payment_event" ALTER COLUMN "is_automatic" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mxnb_balance"`);
        await queryRunner.query(`DROP TABLE "dispute_messages"`);
        await queryRunner.query(`DROP TYPE "public"."dispute_messages_message_type_enum"`);
    }

}
