import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { SiteService } from "../../domain/models/site-service.model";
import { SiteServiceDto } from "../dtos/site-service.dto";
import { SiteServiceRepository } from "../../infrastructure/data/repositories/site-service.repository";

@Injectable()
export class SiteServiceService extends BaseService<
    SiteServiceDto,
    SiteServiceDto,
    SiteServiceDto,
    SiteServiceDto,
    SiteService,
    { siteId: number, serviceId: number }> {
    constructor(private readonly siteServiceRepository: SiteServiceRepository) {
        super(siteServiceRepository);
    }
}