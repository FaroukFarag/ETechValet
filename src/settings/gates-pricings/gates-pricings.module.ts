import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GatePricing } from "./domain/models/gate-pricing.model";
import { GatePricingRepository } from "./infrastructure/data/repositories/gate-pricing.repository";
import { GatePricingService } from "./application/services/gate-pricing.service";
import { GatePricingController } from "./presentation/controllers/gate-pricing.controller";

@Module({
    imports: [TypeOrmModule.forFeature([GatePricing])],
    providers: [GatePricingRepository, GatePricingService],
    controllers: [GatePricingController],
    exports: [GatePricingRepository]
})
export class GatesPricingsModule { }