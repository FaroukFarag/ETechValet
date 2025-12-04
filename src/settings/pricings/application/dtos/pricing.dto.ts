import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { GatePricingDto } from "src/settings/gates-pricings/application/dtos/gate-pricing.dto";
import { PricingType } from "../../domain/enums/pricing-type.enum";
import { WeekDayPricingDto } from "./week-day-pricing.dto";
import { CustomerTypeDto } from "src/settings/customer-types/application/dtos/customer-type.dto";

export class PricingDto extends BaseModelDto<number> {
    siteId: number;
    customerTypeId: number;
    pricingType: PricingType;
    dailyRate: number;
    freeHours: number;
    hourlyRate: number;
    dailyMaxRate: number;
    parkingEnabled: boolean;
    parkingPricingType: PricingType;
    parkingDailyRate: number;
    parkingFreeHours: number;
    parkingHourlyRate: number;
    order: number;
    site: SiteDto;
    customerType: CustomerTypeDto;
    pricingGate: GatePricingDto;
    weekDayPricings: WeekDayPricingDto[];
}