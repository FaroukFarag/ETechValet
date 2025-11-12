import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { GatePricingDto } from "src/settings/gates-pricings/application/dtos/gate-pricing.dto";
import { CustomerType } from "../../domain/enums/customer-type.enum";
import { PricingType } from "../../domain/enums/pricing-type.enum";
import { ParkingPricingType } from "../../domain/enums/parking-pricing-type";
import { WeekDayPricingDto } from "./week-day-pricing.dto";

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
    applyToAllGates: boolean;
    weekDayBasedEnabled: boolean;
    site: SiteDto;
    pricingGates: GatePricingDto[];
    weekDayPricings: WeekDayPricingDto[];
}