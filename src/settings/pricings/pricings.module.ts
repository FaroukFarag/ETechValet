import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pricing } from "./domain/models/pricing.model";
import { PricingRepository } from "./infrastructure/data/repositories/pricing.repository";
import { PricingService } from "./application/services/pricing.service";
import { PricingController } from "./presentation/controllers/pricing.controller";
import { WeekDayPricing } from "./domain/models/week-day-pricing.model";
import { WeekDayPricingRepository } from "./infrastructure/data/repositories/week-day-pricing.repository";
import { GatesModule } from "../gates/gates.module";
import { SitesModule } from "../sites/sites.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Pricing, WeekDayPricing]),
        SitesModule,
        GatesModule
    ],
    providers: [
        PricingRepository,
        WeekDayPricingRepository,
        PricingService
    ],
    controllers: [PricingController],
    exports: [PricingRepository, WeekDayPricingRepository]
})
export class PricingsModule { }