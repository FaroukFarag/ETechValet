import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyIdInRole1763889361241 implements MigrationInterface {
    name = 'ModifyIdInRole1763889361241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "note" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "requestId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_2cc46f69f51c9717355f831e9ec" FOREIGN KEY ("requestId") REFERENCES "pickup_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_5b87d9d19127bd5d92026017a7b"`);
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_2cc46f69f51c9717355f831e9ec"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "notes" character varying`);
        await queryRunner.query(`DROP TABLE "note"`);
    }

}
