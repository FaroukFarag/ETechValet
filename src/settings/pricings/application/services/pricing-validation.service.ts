import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WeekDayPricingDto } from "../dtos/week-day-pricing.dto";
import { Pricing } from "../../domain/models/pricing.model";
import { Site } from "src/settings/sites/domain/models/site.model";
import { GatePricing } from "src/settings/gates-pricings/domain/models/gate-pricing.model";

@Injectable()
export class PricingValidationService {
    ensureWeekDayPricingRequired(weekDays?: WeekDayPricingDto[]) {
        if (!weekDays || weekDays.length === 0)
            throw new BadRequestException("Weekday-based pricing requires weekday rates.");
    }

    ensureSiteExists(site: Site | null) {
        if (!site) throw new NotFoundException("Site not found");
    }

    ensurePricingExists(pricing: Pricing | GatePricing | null) {
        if (!pricing) throw new NotFoundException("Pricing not found");
    }
}
