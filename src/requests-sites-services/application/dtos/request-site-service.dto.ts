import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { SiteServiceDto } from "src/settings/sites-services/application/dtos/site-service.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class RequestSiteServiceDto extends
    BaseModelDto<{ pickupRequestId: number, siteId: number, serviceId: number }> {
    status: number;
    pickupRequest: PickupRequestDto;
    siteService: SiteServiceDto;
}