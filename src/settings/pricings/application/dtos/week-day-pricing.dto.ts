import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { WeekDay } from "../../domain/enums/week-day.enum";
import { PricingDto } from "./pricing.dto";
import { WeekDayPricingType } from "../../domain/enums/week-day-pricing-type.enum";

export class WeekDayPricingDto extends BaseModelDto<number> {
    weekDayPricingType: WeekDayPricingType;
    dayOfWeek: WeekDay;
    dailyRate: number;
    hourlyRate: number;
    dailyMaxRate: number;
    pricingId: number;
    pricing: PricingDto;
}
