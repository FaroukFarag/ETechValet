import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";

export class CardDto extends BaseModelDto<number> {
    type: number;
    number: number;
    siteId: number;
    status: number;
    site: SiteDto;
}