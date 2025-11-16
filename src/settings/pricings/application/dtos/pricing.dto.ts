import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { GatePricingDto } from "src/settings/gates-pricings/application/dtos/gate-pricing.dto";
import { CustomerType } from "../../domain/enums/customer-type.enum";
import { PricingType } from "../../domain/enums/pricing-type.enum";
import { ParkingPricingType } from "../../domain/enums/parking-pricing-type";
import { WeekDayPricingDto } from "./week-day-pricing.dto";
import { Type } from "class-transformer";

export class PricingDto extends BaseModelDto<number> {
    siteId: number;
    customerType: CustomerType;
    pricingType: PricingType;
    dailyRate: number;
    freeHours: number;
    hourlyRate: number;
    dailyMaxRate: number;
    parkingEnabled: boolean;
    parkingPricingType: ParkingPricingType;
    parkingDailyRate: number;
    parkingFreeHours: number;
    parkingHourlyRate: number;
    site: SiteDto;
    pricingGate: GatePricingDto;
    weekDayPricings: WeekDayPricingDto[];
}