import { BaseService } from "src/shared/application/services/base.service";
import { GatePricingDto } from "../dtos/gate-pricing.dto";
import { GatePricing } from "../../domain/models/gate-pricing.model";
import { GatePricingRepository } from "../../infrastructure/data/repositories/gate-pricing.repository";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { PricingRepository } from "src/settings/pricings/infrastructure/data/repositories/pricing.repository";
import { Pricing } from "src/settings/pricings/domain/models/pricing.model";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { WeekDayPricing } from "src/settings/pricings/domain/models/week-day-pricing.model";
import { WeekDayPricingRepository } from "src/settings/pricings/infrastructure/data/repositories/week-day-pricing.repository";
import { ReOrderGatePricingsDto } from "../dtos/reorder-gate-pricings.dto";
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
        private readonly weekDayPricingRepository: WeekDayPricingRepository,
        private readonly gatePricingRepository: GatePricingRepository) {
        super(gatePricingRepository);
    }

    override async create(gatePricingDto: GatePricingDto, entityClass: new () => GatePricing, dtoClass: new () => GatePricingDto): Promise<ResultDto<GatePricingDto>> {
        return this.executeServiceCall("Create Gate Pricing", async () => {
            if (!gatePricingDto.pricing) {
                throw new BadRequestException("Gate Pricing is required.");
            }

            const pricingDto = gatePricingDto.pricing;
            const site = await this.siteRepository.getAsync(pricingDto.siteId);

            if (!site) throw new NotFoundException("Site not found");

            const pricing = this.map(pricingDto, Pricing);

            if (!pricingDto.weekDayPricings || pricingDto.weekDayPricings.length == 0) {
                throw new BadRequestException("Weekday-based pricing requires weekday rates.");
            }

            const gatePricingSpec = new BaseSpecification();
            let order = 1;

            gatePricingSpec.addCriteria(`"gateId" = ${gatePricingDto.id.gateId}`);

            const gatePricings = await this.gatePricingRepository.getAllAsync(gatePricingSpec);

            if (gatePricings.length > 0) {
                const pricingSpec = new BaseSpecification();

                pricingSpec
                    .addCriteria(
                        `"siteId" = ${pricingDto.siteId} AND "customerType" = '${pricingDto.customerType}' AND "id" IN (${gatePricings.map(gatePricing => gatePricing.pricingId).join(",")})`);
                pricingSpec.addOrderBy('order');

                const pricings = await this.pricingRepository.getAllAsync(pricingSpec);

                order = pricings[pricings.length - 1].order + 1;
            }

            pricing.order = order;

            const createdPricing = await this.pricingRepository.createAsync(pricing);

            const pricingGate = new GatePricing();

            pricingGate.gateId = gatePricingDto.id.gateId;
            pricingGate.pricingId = createdPricing.id;

            await this.gatePricingRepository
                .createAsync(pricingGate);

            await this.weekDayPricingRepository
                .createRangeAsync(pricingDto.weekDayPricings.map(weekDayPricingDto => {
                    const weekDayPricing = new WeekDayPricing();

                    weekDayPricing.dayOfWeek = weekDayPricingDto.dayOfWeek;
                    weekDayPricing.pricingId = createdPricing.id;

                    return weekDayPricing;
                }))

            return gatePricingDto;
        });
    }

    override async getById(id: { pricingId: number; gateId: number; }, entityClass: new () => GatePricing, getDtoClass: new () => GatePricingDto): Promise<ResultDto<GatePricingDto>> {
        return this.executeServiceCall(
            'Get Gate Pricing',
            async () => {
                const spec = new BaseSpecification();

                spec.addInclude('pricing');

                const gatePricing = await this.gatePricingRepository.getAsync(id, spec);

                return this.map(gatePricing, GatePricingDto);
            }
        );
    }

    override async getAll(entityClass: new () => GatePricing, getAllDtoClass: new () => GatePricingDto): Promise<ResultDto<GatePricingDto[]>> {
        return this.executeServiceCall(
            'Get All Gate Pricings',
            async () => {
                const spec = new BaseSpecification();

                spec.addInclude('pricing');
                spec.addOrderBy('pricing.order');

                const gatePricings = await this.gatePricingRepository.getAllAsync(spec);

                return this.mapArray(gatePricings, GatePricingDto);
            }
        )
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

    override async update(gatePricingDto: GatePricingDto): Promise<ResultDto<GatePricingDto>> {
        return this.executeServiceCall("Update Gate Pricing", async () => {
            const gatePricingSpec = new BaseSpecification();

            gatePricingSpec.addInclude('pricing');

            const gatePricing = await this.gatePricingRepository.getAsync(gatePricingDto.id);

            if (!gatePricing) throw new NotFoundException("Gate Pricing not found");

            const site = await this.siteRepository.getAsync(gatePricingDto.pricing.siteId);

            if (!site) throw new NotFoundException("Site not found");

            if (!gatePricingDto.pricing.weekDayPricings || gatePricingDto.pricing.weekDayPricings.length == 0) {
                throw new BadRequestException("Weekday-based pricing requires weekday rates.");
            }

            Object.assign(gatePricing, gatePricingDto);

            const pricing = gatePricing.pricing;
            const updated = await this.pricingRepository.updateAsync(pricing);

            const weekDayPricingSpec = new BaseSpecification();

            weekDayPricingSpec.addCriteria(`"pricingId" = ${pricing.id}`);

            const existingWeekDayPricings = await this.weekDayPricingRepository
                .getAllAsync(weekDayPricingSpec);

            const weekDayPricingsToDelete = existingWeekDayPricings
                .filter(weekDay => !gatePricingDto.pricing.weekDayPricings
                    .map(weekDayPricingDto => weekDayPricingDto.id)
                    .includes(weekDay.id));

            await this.weekDayPricingRepository.deleteRangeAsync(weekDayPricingsToDelete);

            await this.weekDayPricingRepository
                .updateRangeAsync(gatePricingDto.pricing.weekDayPricings.map(weekDayPricingDto => {
                    const weekDayPricing = new WeekDayPricing();

                    weekDayPricing.id = weekDayPricingDto.id;
                    weekDayPricing.dayOfWeek = weekDayPricingDto.dayOfWeek;
                    weekDayPricing.pricingId = pricing.id;

                    return weekDayPricing;
                }));

            return this.map(updated, GatePricingDto);
        });
    }

    async reOrderPricings(reOrderGatePricingsDto: ReOrderGatePricingsDto): Promise<ResultDto<PricingDto[]>> {
            return this.executeServiceCall("Reorder Pricings", async () => {
                const ids = reOrderGatePricingsDto.reOrderGatePricingDtos.map(x => x.id.pricingId).join(",");
                const spec = new BaseSpecification();
    
                spec.addCriteria(`"siteId" = ${reOrderGatePricingsDto.siteId} AND "order" != 1 AND "id" IN (${ids})`);
    
                let pricings = await this.pricingRepository.getAllAsync(spec);
    
                if (!pricings || pricings.length === 0)
                    throw new NotFoundException("Pricings not found");
    
                const sortedDtos = reOrderGatePricingsDto.reOrderGatePricingDtos.sort((a, b) => a.order - b.order);
                let newOrder = 2;
    
                for (const dto of sortedDtos) {
                    const pricing = pricings.find(p => p.id === dto.id.pricingId);
                    if (pricing) {
                        pricing.order = newOrder++;
                    }
                }
    
                const updated = await this.pricingRepository.updateRangeAsync(pricings);
    
                return this.mapArray(updated, PricingDto);
            });
        }
}