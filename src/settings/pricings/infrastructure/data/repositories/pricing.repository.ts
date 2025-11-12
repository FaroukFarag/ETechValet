import { Injectable } from "@nestjs/common";
import { Pricing } from "src/settings/pricings/domain/models/pricing.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class PricingRepository extends BaseRepository<Pricing, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Pricing);
    }
}