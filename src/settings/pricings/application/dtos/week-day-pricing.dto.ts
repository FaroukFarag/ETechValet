import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { WeekDay } from "../../domain/enums/week-day.enum";
import { PricingDto } from "./pricing.dto";

export class WeekDayPricingDto extends BaseModelDto<number> {
    dayOfWeek: WeekDay;
    pricingId: number;
    pricing: PricingDto;
}
