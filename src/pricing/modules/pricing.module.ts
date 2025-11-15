import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pricing } from "../entities/pricing.model";
import { PricingService } from "../services/pricing.service";
import { PricingController } from "../presentation/controllers/pricing.controller";
import { Site } from "src/settings/sites/domain/models/site.model";
import { Gate } from "src/settings/gates/domain/models/gate.model";

@Module({
    imports: [TypeOrmModule.forFeature([Pricing, Site, Gate])],
    providers: [PricingService],
    controllers: [PricingController]
})
export class PricingModule { }