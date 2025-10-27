import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1761503109329 implements MigrationInterface {
    name = 'InitialMigration1761503109329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "partner" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "partnerId" character varying NOT NULL, "sitesNumber" boolean NOT NULL, "model" character varying NOT NULL, "fees" integer NOT NULL, "contactPerson" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "email" character varying NOT NULL, "status" character varying NOT NULL, "contract" character varying NOT NULL, CONSTRAINT "PK_8f34ff11ddd5459eacbfacd48ca" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "partner"`);
    }

}
