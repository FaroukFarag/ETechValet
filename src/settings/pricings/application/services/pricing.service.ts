import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { PricingDto } from "../dtos/pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";
import { PricingRepository } from "../../infrastructure/data/repositories/pricing.repository";
import { GatePricingRepository } from "src/settings/gates-pricings/infrastructure/data/repositories/gate-pricing.repository";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { GatePricing } from "src/settings/gates-pricings/domain/models/gate-pricing.model";
import { PricingType } from "../../domain/enums/pricing-type.enum";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { GateRepository } from "src/settings/gates/infrastructure/data/repositories/gate.repository";
import { WeekDayPricing } from "../../domain/models/week-day-pricing.model";
import { WeekDayPricingDto } from "../dtos/week-day-pricing.dto";
import { WeekDayPricingRepository } from "../../infrastructure/data/repositories/week-day-pricing.repository";
import { GatePricingDto } from "src/settings/gates-pricings/application/dtos/gate-pricing.dto";

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
        private readonly gateRepository: GateRepository,
        private readonly gatePricingRepository: GatePricingRepository,
        private readonly weekDayPricingRepository: WeekDayPricingRepository,
        private readonly siteRepository: SiteRepository
    ) {
        super(pricingRepository);
    }

    override async create(pricingDto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Create Pricing", async () => {
            const site = await this.siteRepository.getAsync(pricingDto.siteId);

            if (!site) throw new NotFoundException("Site not found");

            const pricing = this.map(pricingDto, Pricing);

            pricing.site = site;

            if (pricing.weekDayBasedEnabled && !pricingDto.weekDayPricings) {
                throw new BadRequestException("Weekday-based pricing requires weekday rates.");
            }

            const createdPricing = await this.pricingRepository.createAsync(pricing);

            if (pricingDto.applyToAllGates) {
                const pricingGates = await this.applyPricingToAllGates(createdPricing.id, site.id);

                pricingDto.pricingGates = this.mapArray(pricingGates, GatePricingDto);
            }

            if (pricingDto.weekDayPricings && pricingDto.weekDayPricings.length > 0) {
                const weekDayPricings = await this.saveWeekdayPricings(createdPricing.id, pricingDto.weekDayPricings);

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

            const pricings = await this.pricingRepository.getAllAsync(spec);

            return pricings.map(p => this.map(p, PricingDto));
        });
    }

    override async update(dto: PricingDto): Promise<ResultDto<PricingDto>> {
        return this.executeServiceCall("Update Pricing", async () => {
            const pricing = await this.pricingRepository.getAsync(dto.id);

            if (!pricing) throw new NotFoundException("Pricing not found");

            const site = await this.siteRepository.getAsync(dto.siteId);

            if (!site) throw new NotFoundException("Site not found");

            pricing.site = site;

            Object.assign(pricing, dto);

            if (dto.applyToAllGates) {
                const pricingGates = await this.applyPricingToAllGates(pricing.id, site.id);

                dto.pricingGates = this.mapArray(pricingGates, GatePricingDto);
            }

            if (dto.weekDayBasedEnabled) {
                const weekDayPricings = await this.saveWeekdayPricings(pricing.id, dto.weekDayPricings);

                dto.weekDayPricings = this.mapArray(weekDayPricings, WeekDayPricingDto);
            }

            const updated = await this.pricingRepository.updateAsync(pricing);

            return this.map(updated, PricingDto);
        });
    }

    private async applyPricingToAllGates(pricingId: number, siteId: number): Promise<GatePricing[]> {
        const spec = new BaseSpecification();

        spec.addCriteria(`"siteId" = ${siteId}`);

        const gates = await this.gateRepository.getAllAsync(spec);

        if (!gates || gates.length === 0) return [];

        const gatePricings = gates.map(gate => {
            const gatePricing = new GatePricing();

            gatePricing.pricingId = pricingId;
            gatePricing.gateId = gate.id;

            return gatePricing;
        })

        return await this.gatePricingRepository.updateRangeAsync(gatePricings);
    }

    private async saveWeekdayPricings(pricingId: number, weekdayPricingDtos: WeekDayPricingDto[]): Promise<WeekDayPricing[]> {
        if (!weekdayPricingDtos || weekdayPricingDtos.length === 0) return [];

        weekdayPricingDtos.forEach(wd => wd.pricingId = pricingId);

        const weekdayPricings = this.mapArray(weekdayPricingDtos, WeekDayPricing)

        return await this.weekDayPricingRepository.createRangeAsync(weekdayPricings);
    }
}
