import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { PricingService } from "../../application/services/pricing.service";
import { PricingDto } from "../../application/dtos/pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";

@Controller('api/pricings')
export class PricingController extends BaseController<
    PricingService,
    PricingDto,
    PricingDto,
    PricingDto,
    PricingDto,
    Pricing,
    number> {
    constructor(private readonly pricingService: PricingService) {
        super(pricingService);
    }
}