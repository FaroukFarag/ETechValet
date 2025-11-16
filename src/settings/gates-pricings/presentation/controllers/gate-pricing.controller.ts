import { Controller, Get, Param } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { GatePricingService } from "../../application/services/gate-pricing.service";
import { GatePricingDto } from "../../application/dtos/gate-pricing.dto";
import { GatePricing } from "../../domain/models/gate-pricing.model";
import { ResultDto } from "src/shared/application/dtos/result.dto";

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

    @Get('get/:pricingId/:gateId')
    override async get(
        @Param() id: { pricingId: number, gateId: number },
    ): Promise<ResultDto<GatePricingDto>> {
        return this.gatePricingService
            .getById(id, GatePricing, GatePricingDto);
    }

    @Get('get-by-site/:siteId')
    async getBySite(@Param('siteId') siteId: number): Promise<ResultDto<GatePricingDto[]>> {
        return await this.gatePricingService.getBySite(siteId);
    }
}