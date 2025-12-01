import { Injectable } from "@nestjs/common";
import { PricingRepository } from "../../infrastructure/data/repositories/pricing.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { Pricing } from "../../domain/models/pricing.model";

@Injectable()
export class PricingOrderService {
    constructor(private readonly pricingRepository: PricingRepository) { }

    async getNextOrder(siteId: number): Promise<number> {
        const spec = new BaseSpecification();

        spec.addCriteria(`"siteId" = ${siteId}`);
        spec.addOrderBy(`order`);

        const pricings = await this.pricingRepository.getAllAsync(spec);

        return pricings.length === 0 ? 1 : pricings[pricings.length - 1].order + 1;
    }

    reorderByIds(pricings: Pricing[], reorderedItems: { id: number; order: number }[]): Pricing[] {
        reorderedItems.sort((a, b) => a.order - b.order);

        let newOrder = 2;

        for (const item of reorderedItems) {
            const pricing = pricings.find(p => p.id === item.id);
            
            if (pricing) {
                pricing.order = newOrder++;
            }
        }

        return pricings;
    }
}
