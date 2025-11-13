import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { SiteServiceValidator } from "../../domain/models/site-service-validator.model";
import { SiteServiceValidatorDto } from "../dtos/site-service-validator.dto";
import { SiteServiceValidatorRepository } from "../../infrastructure/data/repositories/site-service-validator.repository";

@Injectable()
export class SiteServiceValidatorService extends
    BaseService<
        SiteServiceValidatorDto,
        SiteServiceValidatorDto,
        SiteServiceValidatorDto,
        SiteServiceValidatorDto,
        SiteServiceValidator,
        { siteId: number, serviceId: number, validatorId: number }> {
    constructor(private readonly siteServiceValidatorRepository: SiteServiceValidatorRepository) {
        super(siteServiceValidatorRepository);
    }
}