import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToPickupRequest1763298776053 implements MigrationInterface {
    name = 'AddStatusToPickupRequest1763298776053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pickup_request_status_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "status" "public"."pickup_request_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "notes" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."request_site_service_status_enum" AS ENUM('1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "status" "public"."request_site_service_status_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."request_site_service_status_enum"`);
        await queryRunner.query(`ALTER TABLE "request_site_service" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "request_site_service" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."pickup_request_status_enum"`);
    }

}
