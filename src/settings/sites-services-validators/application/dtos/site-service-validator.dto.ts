import { SiteServiceDto } from "src/settings/sites-services/application/dtos/site-service.dto";
import { ValidatorDto } from "src/settings/validators/application/dtos/validator.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteServiceValidatorDto extends
    BaseModelDto<{ siteId: number, serviceId: number, validatorId: number }> {
    siteService: SiteServiceDto;
    validator: ValidatorDto;
}