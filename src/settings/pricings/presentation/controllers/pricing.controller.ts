import { Body, Controller, Patch } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { PricingService } from "../../application/services/pricing.service";
import { PricingDto } from "../../application/dtos/pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";
import { ReOrderPricingsDto } from "../../application/dtos/reorder-pricings.dto";

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

    @Patch('reorder-pricings')
    async reOrderPricings(@Body() reOrderPricingsDto: ReOrderPricingsDto) {
        return this.pricingService.reOrderPricings(reOrderPricingsDto);
    }
}