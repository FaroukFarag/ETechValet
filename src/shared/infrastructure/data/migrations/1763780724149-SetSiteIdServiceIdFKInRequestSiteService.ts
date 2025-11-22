import { MigrationInterface, QueryRunner } from "typeorm";

export class SetSiteIdServiceIdFKInRequestSiteService1763780724149 implements MigrationInterface {
    name = 'SetSiteIdServiceIdFKInRequestSiteService1763780724149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_fdf04ad863e934485c403778d00"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "siteServiceSiteId"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "siteServiceServiceId"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_5ad835c027e7303ce6d0477f5d2" FOREIGN KEY ("siteId", "serviceId") REFERENCES "site_service"("siteId","serviceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP CONSTRAINT "FK_5ad835c027e7303ce6d0477f5d2"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "siteServiceServiceId" integer`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "siteServiceSiteId" integer`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD CONSTRAINT "FK_fdf04ad863e934485c403778d00" FOREIGN KEY ("siteServiceSiteId", "siteServiceServiceId") REFERENCES "site_service"("siteId","serviceId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
