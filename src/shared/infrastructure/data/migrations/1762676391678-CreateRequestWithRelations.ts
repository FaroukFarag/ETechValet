import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRequestWithRelations1762676391678 implements MigrationInterface {
    name = 'CreateRequestWithRelations1762676391678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recall_request" ("id" SERIAL NOT NULL, "plateType" integer NOT NULL, "plateNumber" character varying NOT NULL, "cardNumber" integer, "customerMobileNumber" integer, "gateId" integer NOT NULL, "parkingLocation" integer NOT NULL, "deliveredById" integer NOT NULL, CONSTRAINT "PK_0b7e742effa21593c8eac6865fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inspection_photo" ("id" SERIAL NOT NULL, "imagePath" character varying NOT NULL, "pickupRequestId" integer NOT NULL, CONSTRAINT "PK_7565a6b694aba700792292c0c24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pickup_request" ("id" SERIAL NOT NULL, "plateType" integer NOT NULL, "plateNumber" character varying NOT NULL, "cardNumber" integer, "customerMobileNumber" integer, "gateId" integer NOT NULL, "customerType" integer NOT NULL, "paymentType" integer NOT NULL, "brand" character varying, "color" character varying, "notes" character varying, "receivedById" integer NOT NULL, "parkedById" integer NOT NULL, CONSTRAINT "PK_cf4a7882e89b0628cc7a1a0ee89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_site_service" ("id" SERIAL NOT NULL, "requestId" integer, "siteServiceId" integer, CONSTRAINT "PK_f167da3b2f296d13d31fc50eda5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_6ce404b6060f8aeda642f65bbce"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_eaa449012dd785224953a85c031" PRIMARY KEY ("serviceId", "siteId", "id")`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "FK_0bada435639f0cc337afe22d9ce"`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "FK_d784695be7fee78b923526b0322"`);
        await queryRunner.query(`ALTER TABLE "site_service" ALTER COLUMN "siteId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_eaa449012dd785224953a85c031"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_cf2ce8916cdac40c79e913dfe0b" PRIMARY KEY ("serviceId", "id")`);
        await queryRunner.query(`ALTER TABLE "site_service" ALTER COLUMN "serviceId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_cf2ce8916cdac40c79e913dfe0b"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_9d6206604fe04654870585fca4e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "site" ALTER COLUMN "fixedValue" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "percentage"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "percentage" integer`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "CHK_3e09109a98aca21e960598db14" CHECK ("percentage" <= 100)`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD CONSTRAINT "FK_c42446fbc272b26ce976cb9a641" FOREIGN KEY ("deliveredById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD CONSTRAINT "FK_ac8ead924e91930384c2a5d762b" FOREIGN KEY ("gateId") REFERENCES "gate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "FK_0bada435639f0cc337afe22d9ce" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "FK_d784695be7fee78b923526b0322" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inspection_photo" ADD CONSTRAINT "FK_d27df0935650f17aa3253f384ec" FOREIGN KEY ("pickupRequestId") REFERENCES "pickup_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_8314a120546d22a896cdf06f42b" FOREIGN KEY ("gateId") REFERENCES "gate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_621fc92557f371cebbb34452501" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_61ccdf9d69a2f386177b22e1f57" FOREIGN KEY ("parkedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62" FOREIGN KEY ("requestId") REFERENCES "pickup_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_520b31e504b9efb6408c398590d" FOREIGN KEY ("siteServiceId") REFERENCES "site_service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_520b31e504b9efb6408c398590d"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_61ccdf9d69a2f386177b22e1f57"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_621fc92557f371cebbb34452501"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_8314a120546d22a896cdf06f42b"`);
        await queryRunner.query(`ALTER TABLE "inspection_photo" DROP CONSTRAINT "FK_d27df0935650f17aa3253f384ec"`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "FK_d784695be7fee78b923526b0322"`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "FK_0bada435639f0cc337afe22d9ce"`);
        await queryRunner.query(`ALTER TABLE "recall_request" DROP CONSTRAINT "FK_ac8ead924e91930384c2a5d762b"`);
        await queryRunner.query(`ALTER TABLE "recall_request" DROP CONSTRAINT "FK_c42446fbc272b26ce976cb9a641"`);
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "CHK_3e09109a98aca21e960598db14"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "percentage"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "percentage" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ALTER COLUMN "fixedValue" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_9d6206604fe04654870585fca4e"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_cf2ce8916cdac40c79e913dfe0b" PRIMARY KEY ("serviceId", "id")`);
        await queryRunner.query(`ALTER TABLE "site_service" ALTER COLUMN "serviceId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_cf2ce8916cdac40c79e913dfe0b"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_eaa449012dd785224953a85c031" PRIMARY KEY ("serviceId", "siteId", "id")`);
        await queryRunner.query(`ALTER TABLE "site_service" ALTER COLUMN "siteId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "FK_d784695be7fee78b923526b0322" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "FK_0bada435639f0cc337afe22d9ce" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP CONSTRAINT "PK_eaa449012dd785224953a85c031"`);
        await queryRunner.query(`ALTER TABLE "site_service" ADD CONSTRAINT "PK_6ce404b6060f8aeda642f65bbce" PRIMARY KEY ("serviceId", "siteId")`);
        await queryRunner.query(`ALTER TABLE "site_service" DROP COLUMN "id"`);
        await queryRunner.query(`DROP TABLE "request_site_service"`);
        await queryRunner.query(`DROP TABLE "pickup_request"`);
        await queryRunner.query(`DROP TABLE "inspection_photo"`);
        await queryRunner.query(`DROP TABLE "recall_request"`);
    }

}
