import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFreeHoursValidationInPricing1764609325901 implements MigrationInterface {
    name = 'AddFreeHoursValidationInPricing1764609325901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" ADD CONSTRAINT "CHK_68ca1a1d35637a3e6774a8f08f" CHECK ("freeHours" <= 24)`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD CONSTRAINT "CHK_68ca1a1d35637a3e6774a8f08f" CHECK ("freeHours" <= 24)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pricing" DROP CONSTRAINT "CHK_68ca1a1d35637a3e6774a8f08f"`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP CONSTRAINT "CHK_68ca1a1d35637a3e6774a8f08f"`);
    }

}
