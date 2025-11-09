import { Injectable } from "@nestjs/common";
import { RequestSiteService } from "src/requests-sites-services/domain/models/request-site-service.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class RequestSiteServiceRepository extends BaseRepository<
    RequestSiteService,
    { requestId: number, siteId: number, serviceId: number }> {
    constructor(dataSource: DataSource) {
        super(dataSource, RequestSiteService);
    }
}