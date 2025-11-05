import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSiteAnGate1762279650740 implements MigrationInterface {
    name = 'CreateSiteAnGate1762279650740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gate" ("id" SERIAL NOT NULL, "gateId" character varying NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "siteId" integer NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_f8d4ea65058f6177925357d1311" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site" ("id" SERIAL NOT NULL, "partnerId" integer NOT NULL, "siteId" character varying NOT NULL, "name" character varying NOT NULL, "gatesNumber" integer NOT NULL, "city" character varying NOT NULL, "address" character varying NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_635c0eeabda8862d5b0237b42b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "partner" DROP COLUMN "sitesNumber"`);
        await queryRunner.query(`ALTER TABLE "partner" ADD "sitesNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gate" ADD CONSTRAINT "FK_6217de52735f7d223eceb3e2505" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "FK_4048c981d15c5864091abb714f5" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "FK_4048c981d15c5864091abb714f5"`);
        await queryRunner.query(`ALTER TABLE "gate" DROP CONSTRAINT "FK_6217de52735f7d223eceb3e2505"`);
        await queryRunner.query(`ALTER TABLE "partner" DROP COLUMN "sitesNumber"`);
        await queryRunner.query(`ALTER TABLE "partner" ADD "sitesNumber" boolean NOT NULL`);
        await queryRunner.query(`DROP TABLE "site"`);
        await queryRunner.query(`DROP TABLE "gate"`);
    }

}
