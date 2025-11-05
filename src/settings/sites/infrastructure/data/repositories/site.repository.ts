import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { Site } from "src/settings/sites/domain/models/site.model";
import { DataSource } from "typeorm";

@Injectable()
export class SiteRepository extends BaseRepository<Site, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Site);
    }
}