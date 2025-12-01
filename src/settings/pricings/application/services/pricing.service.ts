import { Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { PricingDto } from "../dtos/pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";
import { PricingRepository } from "../../infrastructure/data/repositories/pricing.repository";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { WeekDayPricingService } from "./week-day-pricing.service";
import { PricingOrderService } from "./pricing-order.service";
import { PricingValidationService } from "./pricing-validation.service";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { ReOrderPricingsDto } from "../dtos/reorder-pricings.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";

@Injectable()
export class PricingService extends BaseService<
    PricingDto,
    PricingDto,
    PricingDto,
    PricingDto,
    Pricing,
    number> {

    constructor(
        private readonly pricingRepository: PricingRepository,
        private readonly siteRepository: SiteRepository,
        private readonly weekDayPricingService: WeekDayPricingService,
        private readonly orderService: PricingOrderService,
        private readonly validationService: PricingValidationService
    ) {
        super(pricingRepository);
    }

    override async create(dto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Create Pricing", async () => {
            const site = await this.siteRepository.getAsync(dto.siteId);

            this.validationService.ensureSiteExists(site);
            this.validationService.ensureWeekDayPricingRequired(dto.weekDayPricings);

            const pricing = this.map(dto, Pricing);

            pricing.order = await this.orderService.getNextOrder(dto.siteId);

            const created = await this.pricingRepository.createAsync(pricing);

            await this.weekDayPricingService.createForPricing(created.id, dto.weekDayPricings);

            return this.map(created, PricingDto);
        });
    }

    override async update(dto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Update Pricing", async () => {
            const pricing = await this.pricingRepository.getAsync(dto.id);

            this.validationService.ensurePricingExists(pricing);

            const site = await this.siteRepository.getAsync(dto.siteId);

            this.validationService.ensureSiteExists(site);
            this.validationService.ensureWeekDayPricingRequired(dto.weekDayPricings);

            Object.assign(pricing!, dto);

            const updated = await this.pricingRepository.updateAsync(pricing!);

            await this.weekDayPricingService.replacePricingWeekDays(pricing!.id, dto.weekDayPricings);

            return this.map(updated, PricingDto);
        });
    }

    async reOrderPricings(dto: ReOrderPricingsDto): Promise<ResultDto<PricingDto[]>> {
        return this.executeServiceCall("Reorder Pricings", async () => {

            const pricingIds = dto.reOrderPricingDtos.map(x => x.id).join(",");

            const spec = new BaseSpecification();
            spec.addCriteria(`"siteId" = ${dto.siteId} AND "order" != 1 AND "id" IN (${pricingIds})`);

            let pricings = await this.pricingRepository.getAllAsync(spec);

            if (!pricings || pricings.length === 0)
                throw new NotFoundException("Pricings not found");

            const reorderList = dto.reOrderPricingDtos.map(x => ({
                id: x.id,
                order: x.order
            }));

            pricings = this.orderService.reorderByIds(pricings, reorderList);

            const updated = await this.pricingRepository.updateRangeAsync(pricings);

            return this.mapArray(updated, PricingDto);
        });
    }
}
