import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthImplementation1761838951685 implements MigrationInterface {
    name = 'AuthImplementation1761838951685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_claim" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "claimType" character varying NOT NULL, "claimValue" character varying NOT NULL, CONSTRAINT "PK_9a1ce748011a079cd9bed179d54" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "userName" character varying NOT NULL, "passwordHash" character varying NOT NULL, "emailConfirmed" boolean NOT NULL DEFAULT false, "securityStamp" character varying, "phoneNumber" character varying, "phoneNumberConfirmed" boolean NOT NULL DEFAULT false, "twoFactorEnabled" boolean NOT NULL DEFAULT false, "lockoutEnd" TIMESTAMP, "lockoutEnabled" boolean NOT NULL DEFAULT true, "accessFailedCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_da5934070b5f2726ebfd3122c80" UNIQUE ("userName"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_claim" ("id" SERIAL NOT NULL, "roleId" integer NOT NULL, "claimType" character varying NOT NULL, "claimValue" character varying NOT NULL, CONSTRAINT "PK_5ff49a19789bb8f27f8e4091334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "normalizedName" character varying NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_role" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "UQ_c31d0a2f38e6e99110df62ab0af" UNIQUE ("token"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_claim" ADD CONSTRAINT "FK_de29471e37715dadf6eadd312c3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_claim" ADD CONSTRAINT "FK_dc07e78748a2097fd55ac25b2fe" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"`);
        await queryRunner.query(`ALTER TABLE "role_claim" DROP CONSTRAINT "FK_dc07e78748a2097fd55ac25b2fe"`);
        await queryRunner.query(`ALTER TABLE "user_claim" DROP CONSTRAINT "FK_de29471e37715dadf6eadd312c3"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP TABLE "user_role"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "role_claim"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_claim"`);
    }

}
