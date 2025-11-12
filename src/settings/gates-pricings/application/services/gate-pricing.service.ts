import { BaseService } from "src/shared/application/services/base.service";
import { GatePricingDto } from "../dtos/gate-pricing.dto";
import { GatePricing } from "../../domain/models/gate-pricing.model";
import { GatePricingRepository } from "../../infrastructure/data/repositories/gate-pricing.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GatePricingService extends BaseService<
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricingDto,
    GatePricing,
    { pricingId: number, gateId: number }> {
    constructor(private readonly gatePricingRepository: GatePricingRepository) {
        super(gatePricingRepository);
    }
}