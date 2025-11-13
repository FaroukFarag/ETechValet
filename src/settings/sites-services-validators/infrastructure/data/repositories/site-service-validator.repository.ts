import { Injectable } from "@nestjs/common";
import { SiteServiceValidator } from "src/settings/sites-services-validators/domain/models/site-service-validator.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class SiteServiceValidatorRepository extends
    BaseRepository<SiteServiceValidator, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, SiteServiceValidator);
    }
}