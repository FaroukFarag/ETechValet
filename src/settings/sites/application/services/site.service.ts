import { Injectable } from "@nestjs/common";
import { SiteDto } from "../dtos/site.dto";
import { BaseService } from "src/shared/application/services/base.service";
import { Site } from "src/settings/sites/domain/models/site.model";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";

@Injectable()
export class SiteService extends BaseService<
    SiteDto,
    SiteDto,
    SiteDto,
    SiteDto,
    Site,
    number> {
    constructor(protected siteRepository: SiteRepository) {
        super(siteRepository);
    }
}