import { Injectable } from "@nestjs/common";
import { WeekDayPricingRepository } from "../../infrastructure/data/repositories/week-day-pricing.repository";
import { WeekDayPricingDto } from "../dtos/week-day-pricing.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { WeekDayPricing } from "../../domain/models/week-day-pricing.model";

@Injectable()
export class WeekDayPricingService {
    constructor(private readonly repository: WeekDayPricingRepository) { }

    async replacePricingWeekDays(pricingId: number, weekDays: WeekDayPricingDto[]) {
        const spec = new BaseSpecification();

        spec.addCriteria(`"pricingId" = ${pricingId}`);

        const existing = await this.repository.getAllAsync(spec);
        const toDelete = existing.filter(x => !weekDays.map(w => w.id).includes(x.id));

        await this.repository.deleteRangeAsync(toDelete);

        const toUpdate = weekDays.map(dto => {
            const model = new WeekDayPricing();

            model.id = dto.id;
            model.dayOfWeek = dto.dayOfWeek;
            model.pricingId = pricingId;

            return model;
        });

        await this.repository.updateRangeAsync(toUpdate);
    }

    async createForPricing(pricingId: number, weekDays: WeekDayPricingDto[]) {
        return this.repository.createRangeAsync(
            weekDays.map(dto => {
                const m = new WeekDayPricing();

                m.dayOfWeek = dto.dayOfWeek;
                m.pricingId = pricingId;

                return m;
            })
        );
    }
}
