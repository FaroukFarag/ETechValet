import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecalledByInRecallRequest1764586795944 implements MigrationInterface {
    name = 'AddRecalledByInRecallRequest1764586795944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "pickedUpById" integer`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD "recalledById" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recall_request" DROP CONSTRAINT "FK_c42446fbc272b26ce976cb9a641"`);
        await queryRunner.query(`ALTER TABLE "recall_request" ALTER COLUMN "deliveredById" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_80844a883a946e5d41e756d7118" FOREIGN KEY ("pickedUpById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD CONSTRAINT "FK_01c3f546c2628d7fc4c2effe6ff" FOREIGN KEY ("recalledById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD CONSTRAINT "FK_c42446fbc272b26ce976cb9a641" FOREIGN KEY ("deliveredById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recall_request" DROP CONSTRAINT "FK_c42446fbc272b26ce976cb9a641"`);
        await queryRunner.query(`ALTER TABLE "recall_request" DROP CONSTRAINT "FK_01c3f546c2628d7fc4c2effe6ff"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_80844a883a946e5d41e756d7118"`);
        await queryRunner.query(`ALTER TABLE "recall_request" ALTER COLUMN "deliveredById" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recall_request" ADD CONSTRAINT "FK_c42446fbc272b26ce976cb9a641" FOREIGN KEY ("deliveredById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recall_request" DROP COLUMN "recalledById"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "pickedUpById"`);
    }

}
