import { Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { GatePricingDto } from "../dtos/gate-pricing.dto";
import { GatePricing } from "../../domain/models/gate-pricing.model";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { PricingRepository } from "src/settings/pricings/infrastructure/data/repositories/pricing.repository";
import { WeekDayPricingService } from "src/settings/pricings/application/services/week-day-pricing.service";
import { GatePricingRepository } from "../../infrastructure/data/repositories/gate-pricing.repository";
import { PricingOrderService } from "src/settings/pricings/application/services/pricing-order.service";
import { PricingValidationService } from "src/settings/pricings/application/services/pricing-validation.service";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { Pricing } from "src/settings/pricings/domain/models/pricing.model";
import { ReOrderGatePricingsDto } from "../dtos/reorder-gate-pricings.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { PricingDto } from "src/settings/pricings/application/dtos/pricing.dto";

@Injectable()
export class GatePricingService extends BaseService<
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricing,
    { pricingId: number, gateId: number }> {

    constructor(
        private readonly siteRepository: SiteRepository,
        private readonly pricingRepository: PricingRepository,
        private readonly weekDayPricingService: WeekDayPricingService,
        private readonly gatePricingRepository: GatePricingRepository,
        private readonly orderService: PricingOrderService,
        private readonly validationService: PricingValidationService
    ) {
        super(gatePricingRepository);
    }

    override async create(dto: GatePricingDto): Promise<ResultDto<GatePricingDto>> {
        return this.executeServiceCall("Create Gate Pricing", async () => {
            const { pricing } = dto;

            this.validationService.ensureWeekDayPricingRequired(pricing.weekDayPricings);

            const site = await this.siteRepository.getAsync(pricing.siteId);

            this.validationService.ensureSiteExists(site);

            const newPricing = this.map(pricing, Pricing);

            newPricing.order = await this.orderService.getNextOrder(pricing.siteId);

            const created = await this.pricingRepository.createAsync(newPricing);

            await this.weekDayPricingService.createForPricing(created.id, pricing.weekDayPricings);

            const gatePricing = new GatePricing();

            gatePricing.gateId = dto.id.gateId;
            gatePricing.pricingId = created.id;
            gatePricing.enableParkingPricing = dto.enableParkingPricing;
            gatePricing.enableValetPricing = dto.enableValetPricing;

            await this.gatePricingRepository.createAsync(gatePricing);

            return dto;
        });
    }

    async getBySite(siteId: number): Promise<ResultDto<GatePricingDto[]>> {
        return this.executeServiceCall("Get Site Pricings", async () => {
            const spec = new BaseSpecification();

            spec.addCriteria(`pricing.siteId = ${siteId}`);
            spec.addInclude(`pricing`);
            spec.addOrderBy("pricing.order");

            const gatePricings = await this.gatePricingRepository.getAllAsync(spec);

            return this.mapArray(gatePricings, GatePricingDto);
        });
    }

    override async update(dto: GatePricingDto): Promise<ResultDto<GatePricingDto>> {
        return this.executeServiceCall("Update Gate Pricing", async () => {

            const gatePricing = await this.gatePricingRepository.getAsync(dto.id);

            this.validationService.ensurePricingExists(gatePricing);

            const site = await this.siteRepository.getAsync(dto.pricing.siteId);

            this.validationService.ensureSiteExists(site);

            this.validationService.ensureWeekDayPricingRequired(dto.pricing.weekDayPricings);

            Object.assign(gatePricing!, dto);

            const updatedPricing = await this.pricingRepository.updateAsync(gatePricing!.pricing);

            await this.weekDayPricingService.replacePricingWeekDays(
                gatePricing!.pricingId,
                dto.pricing.weekDayPricings
            );

            return this.map(updatedPricing, GatePricingDto);
        });
    }

    async reOrderPricings(dto: ReOrderGatePricingsDto): Promise<ResultDto<PricingDto[]>> {
    return this.executeServiceCall("Reorder Gate Pricings", async () => {

        const pricingIds = dto.reOrderGatePricingDtos.map(x => x.id.pricingId).join(",");

        const spec = new BaseSpecification();
        spec.addCriteria(`"siteId" = ${dto.siteId} AND "order" != 1 AND "id" IN (${pricingIds})`);

        let pricings = await this.pricingRepository.getAllAsync(spec);

        if (!pricings || pricings.length === 0)
            throw new NotFoundException("Pricings not found");

        const reorderList = dto.reOrderGatePricingDtos.map(x => ({
            id: x.id.pricingId,
            order: x.order
        }));

        pricings = this.orderService.reorderByIds(pricings, reorderList);

        const updated = await this.pricingRepository.updateRangeAsync(pricings);

        return this.mapArray(updated, PricingDto);
    });
}

}
