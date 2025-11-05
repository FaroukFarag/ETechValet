import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTemplate1762360277455 implements MigrationInterface {
    name = 'CreateNotificationsTemplate1762360277455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "FK_4048c981d15c5864091abb714f5"`);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "shortName" character varying NOT NULL, "contactPerson" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "address" character varying NOT NULL, "commercialRegistration" character varying NOT NULL, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications_template" ("id" SERIAL NOT NULL, "siteId" integer NOT NULL, "channel" integer NOT NULL, "messageType" character varying NOT NULL, "messageTemplate" character varying NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_e37d0438b1fffd0f210df30b271" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gate" DROP COLUMN "gateId"`);
        await queryRunner.query(`ALTER TABLE "gate" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "partnerId"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "siteId"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "gatesNumber"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "companyId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "valueType" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "fixedValue" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "percentage" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "siteId" integer`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "FK_1e6878409b68613f7f6f8caaf4e" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ff204932278b8bcb5d75986f851" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications_template" ADD CONSTRAINT "FK_23a7d9c0cb364a9b8afa1280f83" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications_template" DROP CONSTRAINT "FK_23a7d9c0cb364a9b8afa1280f83"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ff204932278b8bcb5d75986f851"`);
        await queryRunner.query(`ALTER TABLE "site" DROP CONSTRAINT "FK_1e6878409b68613f7f6f8caaf4e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "siteId"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "percentage"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "fixedValue"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "valueType"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "site" ADD "city" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "gatesNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "siteId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "site" ADD "partnerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gate" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "gate" ADD "gateId" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "notifications_template"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`ALTER TABLE "site" ADD CONSTRAINT "FK_4048c981d15c5864091abb714f5" FOREIGN KEY ("partnerId") REFERENCES "partner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
