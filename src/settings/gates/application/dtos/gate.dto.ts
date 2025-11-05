import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";

export class GateDto extends BaseModelDto<number> {
    name: string;
    siteId: number;
    status: string;
    site: SiteDto;
}