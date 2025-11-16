import { Controller, Get, Param, Patch } from "@nestjs/common";
import { RequestSiteServiceDto } from "src/requests-sites-services/application/dtos/request-site-service.dto";
import { UpdateRequestSiteServiceStatusDto } from "src/requests-sites-services/application/dtos/update-request-site-service-status.dto";
import { RequestSiteServiceService } from "src/requests-sites-services/application/services/request-site-service.service";
import { RequestSiteService } from "src/requests-sites-services/domain/models/request-site-service.model";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/requests-sites-services')
export class RequestSiteServiceController extends BaseController<
    RequestSiteServiceService,
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteServiceDto,
    RequestSiteService,
    { pickupRequestId: number, siteId: number, serviceId: number }> {
    constructor(private readonly requestSiteServiceService: RequestSiteServiceService) {
        super(requestSiteServiceService);
    }

    @Get('get/:pickupRequestId/:siteId/:serviceId')
    override async get(
        @Param() id: { pickupRequestId: number, siteId: number, serviceId: number },
    ): Promise<ResultDto<RequestSiteServiceDto>> {
        return this.requestSiteServiceService
            .getById(id, RequestSiteService, RequestSiteServiceDto);
    }

    @Patch('update-request-site-service-status')
    async updateRequestServiceStatus(updateRequestSiteServiceStatusDto: UpdateRequestSiteServiceStatusDto) {
        return this.requestSiteServiceService.updateRequestSiteServiceStatus(updateRequestSiteServiceStatusDto);
    }
}