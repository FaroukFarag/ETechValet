import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesInRecallRequest1764608473456 implements MigrationInterface {
    name = 'AddNotesInRecallRequest1764608473456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recall_request" ADD "notes" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recall_request" DROP COLUMN "notes"`);
    }

}
