import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompany1762354350530 implements MigrationInterface {
    name = 'CreateCompany1762354350530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "shortName" character varying NOT NULL, "contactPerson" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "address" character varying NOT NULL, "commercialRegistration" character varying NOT NULL, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "company"`);
    }

}
