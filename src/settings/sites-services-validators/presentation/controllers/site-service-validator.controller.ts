import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { SiteServiceValidatorService } from "../../application/services/site-service-validator.service";
import { SiteServiceValidator } from "../../domain/models/site-service-validator.model";
import { SiteServiceValidatorDto } from "../../application/dtos/site-service-validator.dto";

@Controller('api/sites-services-validators')
export class SiteServiceValidatorController extends BaseController<
    SiteServiceValidatorService,
    SiteServiceValidatorDto,
    SiteServiceValidatorDto,
    SiteServiceValidatorDto,
    SiteServiceValidatorDto,
    SiteServiceValidator,
    { siteId: number, serviceId: number, validatorId: number }> {
    constructor(private readonly siteServiceValidatorService: SiteServiceValidatorService) {
        super(siteServiceValidatorService);
    }
}