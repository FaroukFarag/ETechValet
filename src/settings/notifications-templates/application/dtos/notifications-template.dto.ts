import { SiteDto } from "src/settings/sites/application/dtos/site.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class NotificationsTemplateDto extends BaseModelDto<number> {
    siteId: number;
    channel: number;
    messageType: string;
    messageTemplate: string;
    status: number;
    site: SiteDto;
}
