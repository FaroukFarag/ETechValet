import { Injectable } from "@nestjs/common";
import { WeekDayPricing } from "src/settings/pricings/domain/models/week-day-pricing.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class WeekDayPricingRepository extends BaseRepository<WeekDayPricing, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, WeekDayPricing);
    }
}