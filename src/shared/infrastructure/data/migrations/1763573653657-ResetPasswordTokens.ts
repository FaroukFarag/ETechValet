import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetPasswordTokens1763573653657 implements MigrationInterface {
    name = 'ResetPasswordTokens1763573653657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reset_password_token" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL, CONSTRAINT "PK_c6f6eb8f5c88ac0233eceb8d385" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reset_password_token" ADD CONSTRAINT "FK_3fde3055d9d16236c05d030915e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reset_password_token" DROP CONSTRAINT "FK_3fde3055d9d16236c05d030915e"`);
        await queryRunner.query(`DROP TABLE "reset_password_token"`);
    }

}
