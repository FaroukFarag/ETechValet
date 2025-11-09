import { ServiceDto } from "src/settings/services/application/dtos/service.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteServiceDto extends BaseModelDto<{ siteId: number, serviceId: number }> {
    amount: number;
    site: SiteDto
    service: ServiceDto
}