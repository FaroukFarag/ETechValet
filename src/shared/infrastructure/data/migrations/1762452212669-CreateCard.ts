import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCard1762452212669 implements MigrationInterface {
    name = 'CreateCard1762452212669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "siteId" integer NOT NULL, "status" integer NOT NULL, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gate" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "gate" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications_template" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "notifications_template" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_432599e3d3621ba4312d26b53ea" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_432599e3d3621ba4312d26b53ea"`);
        await queryRunner.query(`ALTER TABLE "notifications_template" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "notifications_template" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gate" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "gate" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TABLE "card"`);
    }

}
