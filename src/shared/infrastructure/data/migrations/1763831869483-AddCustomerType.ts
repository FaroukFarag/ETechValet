import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerType1763831869483 implements MigrationInterface {
    name = 'AddCustomerType1763831869483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" RENAME COLUMN "customerType" TO "customerTypeId"`);
        await queryRunner.query(`ALTER TYPE "public"."pricing_customertype_enum" RENAME TO "pricing_customertypeid_enum"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" RENAME COLUMN "customerType" TO "customerTypeId"`);
        await queryRunner.query(`ALTER TYPE "public"."pickup_request_customertype_enum" RENAME TO "pickup_request_customertypeid_enum"`);
        await queryRunner.query(`CREATE TABLE "customer_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "siteId" integer NOT NULL, CONSTRAINT "PK_27263e272a2a6e304c9e7d69045" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "customerTypeId"`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "customerTypeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "customerTypeId"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "customerTypeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD CONSTRAINT "FK_2ae90aaeb5a14b6c9e73b50a0a7" FOREIGN KEY ("customerTypeId") REFERENCES "customer_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_type" ADD CONSTRAINT "FK_4653690a20dd143659d011f29ca" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_0336d9ec097bc04c36946b0bd87" FOREIGN KEY ("customerTypeId") REFERENCES "customer_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_0336d9ec097bc04c36946b0bd87"`);
        await queryRunner.query(`ALTER TABLE "customer_type" DROP CONSTRAINT "FK_4653690a20dd143659d011f29ca"`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP CONSTRAINT "FK_2ae90aaeb5a14b6c9e73b50a0a7"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "customerTypeId"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "customerTypeId" "public"."pickup_request_customertypeid_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "customerTypeId"`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "customerTypeId" "public"."pricing_customertypeid_enum" NOT NULL`);
        await queryRunner.query(`DROP TABLE "customer_type"`);
        await queryRunner.query(`ALTER TYPE "public"."pickup_request_customertypeid_enum" RENAME TO "pickup_request_customertype_enum"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" RENAME COLUMN "customerTypeId" TO "customerType"`);
        await queryRunner.query(`ALTER TYPE "public"."pricing_customertypeid_enum" RENAME TO "pricing_customertype_enum"`);
        await queryRunner.query(`ALTER TABLE "pricing" RENAME COLUMN "customerTypeId" TO "customerType"`);
    }

}
