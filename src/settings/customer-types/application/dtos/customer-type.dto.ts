import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { PricingDto } from "src/settings/pricings/application/dtos/pricing.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class CustomerTypeDto extends BaseModelDto<number> {
    name: string;
    siteId: number;
    site: SiteDto;
    pricings: PricingDto[];
    pickupRequests: PickupRequestDto[];
}