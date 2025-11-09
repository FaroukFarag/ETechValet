import { Injectable } from "@nestjs/common";
import { RequestSiteService } from "src/requests-sites-services/domain/models/request-site-service.model";
import { BaseService } from "src/shared/application/services/base.service";
import { RequestSiteServiceDto } from "../dtos/request-site-service.dto";
import { RequestSiteServiceRepository } from "src/requests-sites-services/infrastructure/data/repositories/request-site-service.repository";

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
}