import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GatePricing } from "./domain/models/gate-pricing.model";
import { GatePricingRepository } from "./infrastructure/data/repositories/gate-pricing.repository";
import { GatePricingService } from "./application/services/gate-pricing.service";
import { GatePricingController } from "./presentation/controllers/gate-pricing.controller";
import { SitesModule } from "../sites/sites.module";
import { PricingsModule } from "../pricings/pricings.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([GatePricing]),
        SitesModule,
        PricingsModule
    ],
    providers: [GatePricingRepository, GatePricingService],
    controllers: [GatePricingController],
    exports: [GatePricingRepository]
})
export class GatesPricingsModule { }