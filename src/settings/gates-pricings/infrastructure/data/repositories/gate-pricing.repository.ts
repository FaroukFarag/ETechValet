import { Injectable } from "@nestjs/common";
import { GatePricing } from "src/settings/gates-pricings/domain/models/gate-pricing.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class GatePricingRepository extends BaseRepository<
    GatePricing, { gateId: number, pricingId: number }> {
    constructor(dataSource: DataSource) {
        super(dataSource, GatePricing);
    }
}