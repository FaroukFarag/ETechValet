import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { SiteDto } from "src/settings/sites/application/dtos/site.dto";

export class ServiceDto extends BaseModelDto<number> {
    name: string;
    description: string;
    status: number;
}