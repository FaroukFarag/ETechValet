import { SiteServiceValidatorDto } from "src/settings/sites-services-validators/application/dtos/site-service-validator.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class ValidatorDto extends BaseModelDto<number> {
    name: string;
    siteId: number;
    credits: number;
    description: string;
    canValidateParking: boolean;
    canValidateValet: boolean;
    discountFixedEnabled: boolean;
    discountValue: number;
    percentageEnabled: boolean;
    percentageValue: number;
    site: SiteDto;
    validatorSiteServices: SiteServiceValidatorDto[];
}