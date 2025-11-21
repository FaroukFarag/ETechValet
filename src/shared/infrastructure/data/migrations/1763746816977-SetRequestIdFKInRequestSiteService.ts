import { MigrationInterface, QueryRunner } from "typeorm";

export class SetRequestIdFKInRequestSiteService1763746816977 implements MigrationInterface {
    name = 'SetRequestIdFKInRequestSiteService1763746816977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "PK_7a842469f0cf599687292925403"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "PK_5ad835c027e7303ce6d0477f5d2" PRIMARY KEY ("siteId", "serviceId")`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "pickupRequestId"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "PK_5ad835c027e7303ce6d0477f5d2"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "PK_9518160bbb3430e8dbc0d01aa4b" PRIMARY KEY ("requestId", "siteId", "serviceId")`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ALTER COLUMN "requestId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62" FOREIGN KEY ("requestId") REFERENCES "pickup_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ALTER COLUMN "requestId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_b038c5a1d01f27342e1a93abb62" FOREIGN KEY ("requestId") REFERENCES "pickup_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "PK_9518160bbb3430e8dbc0d01aa4b"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "PK_5ad835c027e7303ce6d0477f5d2" PRIMARY KEY ("siteId", "serviceId")`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "pickupRequestId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "PK_5ad835c027e7303ce6d0477f5d2"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "PK_7a842469f0cf599687292925403" PRIMARY KEY ("pickupRequestId", "siteId", "serviceId")`);
    }

}
