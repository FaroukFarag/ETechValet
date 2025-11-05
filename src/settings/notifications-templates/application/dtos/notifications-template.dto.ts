import { SiteDto } from "src/settings/sites/application/dtos/site.dto";

export class NotificationsTemplateDto {
    siteId: number;
    channel: number;
    messageType: string;
    messageTemplate: string;
    status: string;
    site: SiteDto;
}
