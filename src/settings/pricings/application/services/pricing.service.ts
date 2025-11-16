import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { PricingDto } from "../dtos/pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";
import { PricingRepository } from "../../infrastructure/data/repositories/pricing.repository";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { WeekDayPricing } from "../../domain/models/week-day-pricing.model";
import { WeekDayPricingDto } from "../dtos/week-day-pricing.dto";
import { WeekDayPricingRepository } from "../../infrastructure/data/repositories/week-day-pricing.repository";
import { ReOrderPricingsDto } from "../dtos/reorder-pricings.dto";

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
        private readonly weekDayPricingRepository: WeekDayPricingRepository,
        private readonly siteRepository: SiteRepository
    ) {
        super(pricingRepository);
    }

    override async create(pricingDto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Create Pricing", async () => {
            const spec = new BaseSpecification();

            spec.addCriteria(`"siteId" = ${pricingDto.siteId} AND "customerType" = '${pricingDto.customerType}'`);
            spec.addOrderBy('order')

            const pricings = await this.pricingRepository.getAllAsync(spec);
            const site = await this.siteRepository.getAsync(pricingDto.siteId);

            if (!site) throw new NotFoundException("Site not found");

            const pricing = this.map(pricingDto, Pricing);

            pricing.order = pricings && pricings.length > 0 ?
                pricings[pricings.length - 1].order + 1 : 1;

            if (pricing.order !== 0 && (!pricingDto.weekDayPricings ||
                pricingDto.weekDayPricings.length === 0)) {
                throw new BadRequestException("Weekday-based pricing requires weekday rates.");
            }

            const createdPricing = await this.pricingRepository.createAsync(pricing);

            if (pricing.order !== 0) {
                const weekDayPricings = await this.weekDayPricingRepository
                    .createRangeAsync(pricingDto.weekDayPricings.map(weekDayPricingDto => {
                        const weekDayPricing = new WeekDayPricing();

                        weekDayPricing.dayOfWeek = weekDayPricingDto.dayOfWeek;
                        weekDayPricing.pricingId = createdPricing.id;

                        return weekDayPricing;
                    }));

                pricingDto.weekDayPricings = this.mapArray(weekDayPricings, WeekDayPricingDto);
            }

            return this.map(createdPricing, PricingDto);
        });
    }

    override async getById(id: number, entityClass: new () => Pricing, getDtoClass: new () => PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Get Pricing", async () => {
            const spec = new BaseSpecification();

            spec.addInclude("pricingGates");
            spec.addInclude("weekDayPricings");

            const pricing = await this.pricingRepository.getAsync(id, spec);

            return this.map(pricing, PricingDto);
        });
    }

    async getBySite(siteId: number): Promise<ResultDto<PricingDto[]>> {
        return this.executeServiceCall("Get Site Pricings", async () => {
            const spec = new BaseSpecification();

            spec.addCriteria(`"siteId" = ${siteId}`);
            spec.addOrderBy("order");

            const pricings = await this.pricingRepository.getAllAsync(spec);

            return pricings.map(p => this.map(p, PricingDto));
        });
    }

    override async update(pricingDto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Update Pricing", async () => {
            const pricing = await this.pricingRepository.getAsync(pricingDto.id);

            if (!pricing) throw new NotFoundException("Pricing not found");

            const site = await this.siteRepository.getAsync(pricingDto.siteId);

            if (!site) throw new NotFoundException("Site not found");

            if (!pricingDto.weekDayPricings || pricingDto.weekDayPricings.length == 0) {
                throw new BadRequestException("Weekday-based pricing requires weekday rates.");
            }

            Object.assign(pricing, pricingDto);

            const updated = await this.pricingRepository.updateAsync(pricing);

            if (pricing.order != 1 && pricingDto.weekDayPricings &&
                pricingDto.weekDayPricings.length > 0) {
                const weekDayPricingSpec = new BaseSpecification();

                weekDayPricingSpec.addCriteria(`"pricingId" = ${pricing.id}`);

                const existingWeekDayPricings = await this.weekDayPricingRepository
                    .getAllAsync(weekDayPricingSpec);

                const weekDayPricingsToDelete = existingWeekDayPricings
                    .filter(weekDay => !pricingDto.weekDayPricings
                        .map(weekDayPricingDto => weekDayPricingDto.id)
                        .includes(weekDay.id));

                await this.weekDayPricingRepository.deleteRangeAsync(weekDayPricingsToDelete);

                await this.weekDayPricingRepository
                    .updateRangeAsync(pricingDto.weekDayPricings.map(weekDayPricingDto => {
                        const weekDayPricing = new WeekDayPricing();

                        weekDayPricing.id = weekDayPricingDto.id;
                        weekDayPricing.dayOfWeek = weekDayPricingDto.dayOfWeek;
                        weekDayPricing.pricingId = pricing.id;

                        return weekDayPricing;
                    }));
            }

            return this.map(updated, PricingDto);
        });
    }

    async reOrderPricings(reOrderPricingsDto: ReOrderPricingsDto): Promise<ResultDto<PricingDto[]>> {
        return this.executeServiceCall("Reorder Pricings", async () => {
            const ids = reOrderPricingsDto.reOrderPricingDtos.map(x => x.id).join(",");
            const spec = new BaseSpecification();

            spec.addCriteria(`"siteId" = ${reOrderPricingsDto.siteId} AND "order" != 1 AND "id" IN (${ids})`);

            let pricings = await this.pricingRepository.getAllAsync(spec);

            if (!pricings || pricings.length === 0)
                throw new NotFoundException("Pricings not found");

            const sortedDtos = reOrderPricingsDto.reOrderPricingDtos.sort((a, b) => a.order - b.order);
            let newOrder = 2;

            for (const dto of sortedDtos) {
                const pricing = pricings.find(p => p.id === dto.id);
                if (pricing) {
                    pricing.order = newOrder++;
                }
            }

            const updated = await this.pricingRepository.updateRangeAsync(pricings);

            return this.mapArray(updated, PricingDto);
        });
    }
}
