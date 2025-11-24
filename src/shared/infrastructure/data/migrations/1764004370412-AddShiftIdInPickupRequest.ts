import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShiftIdInPickupRequest1764004370412 implements MigrationInterface {
    name = 'AddShiftIdInPickupRequest1764004370412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_9eac08b22017eacf6d5d4cbf48b"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ALTER COLUMN "shiftId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_9eac08b22017eacf6d5d4cbf48b" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP CONSTRAINT "FK_9eac08b22017eacf6d5d4cbf48b"`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ALTER COLUMN "shiftId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD CONSTRAINT "FK_9eac08b22017eacf6d5d4cbf48b" FOREIGN KEY ("shiftId") REFERENCES "shift"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
