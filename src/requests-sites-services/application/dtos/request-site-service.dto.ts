import { RequestSiteServiceStatus } from "src/requests-sites-services/domain/enums/request-site-service-status.enum";
import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { SiteServiceDto } from "src/settings/sites-services/application/dtos/site-service.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class RequestSiteServiceDto extends
    BaseModelDto<{ pickupRequestId: number, siteId: number, serviceId: number }> {
    status: RequestSiteServiceStatus;
    notes: string;
    pickupRequest: PickupRequestDto;
    siteService: SiteServiceDto;
}