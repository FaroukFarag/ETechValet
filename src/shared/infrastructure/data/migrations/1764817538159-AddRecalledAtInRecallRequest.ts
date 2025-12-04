import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecalledAtInRecallRequest1764817538159 implements MigrationInterface {
    name = 'AddRecalledAtInRecallRequest1764817538159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recall_request" ADD "recalledAt" TIMESTAMP NOT NULL DEFAULT '"2025-12-04T03:05:46.281Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recall_request" DROP COLUMN "recalledAt"`);
    }

}
