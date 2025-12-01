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
import { WeekDayPricingService } from "./application/services/week-day-pricing.service";
import { PricingOrderService } from "./application/services/pricing-order.service";
import { PricingValidationService } from "./application/services/pricing-validation.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Pricing, WeekDayPricing]),
        SitesModule,
        GatesModule
    ],
    providers: [
        PricingRepository,
        WeekDayPricingRepository,
        PricingService,
        WeekDayPricingService,
        PricingOrderService,
        PricingValidationService
    ],
    controllers: [PricingController],
    exports: [
        PricingRepository,
        WeekDayPricingRepository,
        WeekDayPricingService,
        PricingOrderService,
        PricingValidationService
    ]
})
export class PricingsModule { }