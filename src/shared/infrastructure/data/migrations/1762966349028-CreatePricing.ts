import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePricing1762966349028 implements MigrationInterface {
    name = 'CreatePricing1762966349028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."week_day_pricing_weekdaypricingtype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."week_day_pricing_dayofweek_enum" AS ENUM('0', '1', '2', '3', '4', '5', '6')`);
        await queryRunner.query(`CREATE TABLE "week_day_pricing" ("id" SERIAL NOT NULL, "weekDayPricingType" "public"."week_day_pricing_weekdaypricingtype_enum" NOT NULL, "dayOfWeek" "public"."week_day_pricing_dayofweek_enum" NOT NULL, "dailyRate" numeric(10,2), "hourlyRate" numeric(10,2), "dailyMaxRate" numeric(10,2), "pricingId" integer NOT NULL, CONSTRAINT "PK_5fca51456a42039f78d524f77c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pricing_customertype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."pricing_pricingtype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."pricing_parkingpricingtype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "pricing" ("id" SERIAL NOT NULL, "siteId" integer NOT NULL, "customerType" "public"."pricing_customertype_enum" NOT NULL, "pricingType" "public"."pricing_pricingtype_enum" NOT NULL, "dailyRate" numeric(10,2), "freeHours" integer NOT NULL, "hourlyRate" numeric(10,2), "dailyMaxRate" numeric(10,2), "parkingEnabled" boolean NOT NULL, "parkingPricingType" "public"."pricing_parkingpricingtype_enum" NOT NULL, "parkingDailyRate" numeric(10,2), "parkingFreeHours" integer, "parkingHourlyRate" numeric(10,2), "applyToAllGates" boolean NOT NULL DEFAULT false, "weekDayBasedEnabled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4f6e9c88033106a989aa7ce9dee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gate_pricing" ("pricingId" integer NOT NULL, "gateId" integer NOT NULL, CONSTRAINT "PK_7862ab2850b850b772ef96decb2" PRIMARY KEY ("pricingId", "gateId"))`);
        await queryRunner.query(`ALTER TABLE "week_day_pricing" ADD CONSTRAINT "FK_458d18368ed868951c7ddf2a1f8" FOREIGN KEY ("pricingId") REFERENCES "pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pricing" ADD CONSTRAINT "FK_7376a69a22245e00692540ba9e5" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gate_pricing" ADD CONSTRAINT "FK_54aa8897fcd1d7509781c517754" FOREIGN KEY ("pricingId") REFERENCES "pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gate_pricing" ADD CONSTRAINT "FK_b1bd81e739ce80b411d049f4ed9" FOREIGN KEY ("gateId") REFERENCES "gate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gate_pricing" DROP CONSTRAINT "FK_b1bd81e739ce80b411d049f4ed9"`);
        await queryRunner.query(`ALTER TABLE "gate_pricing" DROP CONSTRAINT "FK_54aa8897fcd1d7509781c517754"`);
        await queryRunner.query(`ALTER TABLE "pricing" DROP CONSTRAINT "FK_7376a69a22245e00692540ba9e5"`);
        await queryRunner.query(`ALTER TABLE "week_day_pricing" DROP CONSTRAINT "FK_458d18368ed868951c7ddf2a1f8"`);
        await queryRunner.query(`DROP TABLE "gate_pricing"`);
        await queryRunner.query(`DROP TABLE "pricing"`);
        await queryRunner.query(`DROP TYPE "public"."pricing_parkingpricingtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pricing_pricingtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pricing_customertype_enum"`);
        await queryRunner.query(`DROP TABLE "week_day_pricing"`);
        await queryRunner.query(`DROP TYPE "public"."week_day_pricing_dayofweek_enum"`);
        await queryRunner.query(`DROP TYPE "public"."week_day_pricing_weekdaypricingtype_enum"`);
    }

}
