import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateValidator1763056622489 implements MigrationInterface {
    name = 'CreateValidator1763056622489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "validator" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "siteId" integer NOT NULL, "credits" numeric(10,2) NOT NULL, "description" character varying NOT NULL, "canValidateParking" boolean NOT NULL, "canValidateValet" boolean NOT NULL, "discountFixedEnabled" boolean NOT NULL, "discountValue" numeric(10,2), "percentageEnabled" boolean NOT NULL, "percentageValue" numeric(10,2), CONSTRAINT "CHK_cc1c822f80a227dad4b8f0704e" CHECK ("percentage" <= 100), CONSTRAINT "PK_ae0a943022c24bd60e7161e0fad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_service_validator" ("siteId" integer NOT NULL, "serviceId" integer NOT NULL, "validatorId" integer NOT NULL, "siteServiceSiteId" integer, "siteServiceServiceId" integer, CONSTRAINT "PK_009d76ae16fd5d68ca5cba96276" PRIMARY KEY ("siteId", "serviceId", "validatorId"))`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "customerType"`);
        await queryRunner.query(`CREATE TYPE "public"."pickup_request_customertype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "customerType" "public"."pickup_request_customertype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "paymentType"`);
        await queryRunner.query(`CREATE TYPE "public"."pickup_request_paymenttype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "paymentType" "public"."pickup_request_paymenttype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "validator" ADD CONSTRAINT "FK_e26a74e30cb4aba2a233ae028ca" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service_validator" ADD CONSTRAINT "FK_f533ca0110336ee62b65196e2aa" FOREIGN KEY ("siteServiceSiteId", "siteServiceServiceId") REFERENCES "site_service"("siteId","serviceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service_validator" ADD CONSTRAINT "FK_8296b03cf0889caa8ca757a3f31" FOREIGN KEY ("validatorId") REFERENCES "validator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_service_validator" DROP CONSTRAINT "FK_8296b03cf0889caa8ca757a3f31"`);
        await queryRunner.query(`ALTER TABLE "site_service_validator" DROP CONSTRAINT "FK_f533ca0110336ee62b65196e2aa"`);
        await queryRunner.query(`ALTER TABLE "validator" DROP CONSTRAINT "FK_e26a74e30cb4aba2a233ae028ca"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "paymentType"`);
        await queryRunner.query(`DROP TYPE "public"."pickup_request_paymenttype_enum"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "paymentType" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "customerType"`);
        await queryRunner.query(`DROP TYPE "public"."pickup_request_customertype_enum"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "customerType" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "site_service_validator"`);
        await queryRunner.query(`DROP TABLE "validator"`);
    }

}
