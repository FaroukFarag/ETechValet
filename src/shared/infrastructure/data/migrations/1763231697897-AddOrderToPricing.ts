import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderToPricing1763231697897 implements MigrationInterface {
    name = 'AddOrderToPricing1763231697897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" RENAME COLUMN "weekDayBasedEnabled" TO "order"`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "order" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD "order" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pricing" RENAME COLUMN "order" TO "weekDayBasedEnabled"`);
    }

}
