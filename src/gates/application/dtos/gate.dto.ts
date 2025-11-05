import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/sites/application/dtos/site.dto";

export class GateDto extends BaseModelDto<number> {
    gateId: string;
    name: string;
    type: string;
    siteId: number;
    status: string;
    site: SiteDto;
}