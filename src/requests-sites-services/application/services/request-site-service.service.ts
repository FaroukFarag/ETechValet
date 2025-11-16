import { Injectable, NotFoundException } from "@nestjs/common";
import { RequestSiteService } from "src/requests-sites-services/domain/models/request-site-service.model";
import { BaseService } from "src/shared/application/services/base.service";
import { RequestSiteServiceDto } from "../dtos/request-site-service.dto";
import { RequestSiteServiceRepository } from "src/requests-sites-services/infrastructure/data/repositories/request-site-service.repository";
import { UpdateRequestSiteServiceStatusDto } from "../dtos/update-request-site-service-status.dto";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Injectable()
export class RequestSiteServiceService extends BaseService<
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteService,
    { pickupRequestId: number, siteId: number, serviceId: number }> {
    constructor(private readonly requestSiteServiceRepository: RequestSiteServiceRepository) {
        super(requestSiteServiceRepository);
    }

    async updateRequestSiteServiceStatus(updateRequestSiteServiceStatusDto: UpdateRequestSiteServiceStatusDto): Promise<ResultDto<RequestSiteServiceDto>> {
        return this.executeServiceCall(
            'Request Site Service Status',
            async () => {
                let pickupRequestSiteService = await this.requestSiteServiceRepository.getAsync(updateRequestSiteServiceStatusDto.id);

                if (!pickupRequestSiteService) throw new NotFoundException("Pickup Request Site Service not found");

                pickupRequestSiteService.status = updateRequestSiteServiceStatusDto.status;

                if (updateRequestSiteServiceStatusDto.notes)
                    pickupRequestSiteService.notes = updateRequestSiteServiceStatusDto.notes

                pickupRequestSiteService = await this.requestSiteServiceRepository.updateAsync(pickupRequestSiteService);

                return this.map(pickupRequestSiteService, RequestSiteServiceDto)
            }
        )
    }
}