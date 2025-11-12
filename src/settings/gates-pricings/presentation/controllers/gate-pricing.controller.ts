import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { GatePricingService } from "../../application/services/gate-pricing.service";
import { GatePricingDto } from "../../application/dtos/gate-pricing.dto";
import { GatePricing } from "../../domain/models/gate-pricing.model";

@Controller('api/gates-pricings')
export class GatePricingController extends BaseController<
    GatePricingService,
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricing,
    { pricingId: number, gateId: number }> {
    constructor(private readonly gatePricingService: GatePricingService) {
        super(gatePricingService);
    }
}