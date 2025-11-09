import { Injectable } from "@nestjs/common";
import { SiteService } from "src/settings/sites-services/domain/models/site-service.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class SiteServiceRepository extends BaseRepository<
    SiteService,
    { siteId: number, serviceId: number }> {
    constructor(dataSource: DataSource) {
        super(dataSource, SiteService);
    }
}