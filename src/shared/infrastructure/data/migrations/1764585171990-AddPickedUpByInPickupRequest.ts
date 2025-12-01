import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPickedUpByInPickupRequest1764585171990 implements MigrationInterface {
    name = 'AddPickedUpByInPickupRequest1764585171990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "pickedUpById" integer`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_80844a883a946e5d41e756d7118" FOREIGN KEY ("pickedUpById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_80844a883a946e5d41e756d7118"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "pickedUpById"`);
    }

}
