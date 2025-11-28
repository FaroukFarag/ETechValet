import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParkingLocationInPickupRequest1764343423308 implements MigrationInterface {
    name = 'AddParkingLocationInPickupRequest1764343423308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" ADD "parkingLocation" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_request" DROP COLUMN "parkingLocation"`);
    }

}
