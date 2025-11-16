import { RequestSiteServiceStatus } from "src/requests-sites-services/domain/enums/request-site-service-status.enum";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class UpdateRequestSiteServiceStatusDto extends BaseModelDto<{ pickupRequestId: number, siteId: number, serviceId: number }> {
    status: RequestSiteServiceStatus;
    notes: string;
}