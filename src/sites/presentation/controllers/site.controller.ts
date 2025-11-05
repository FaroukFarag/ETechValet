import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { SiteDto } from "src/sites/application/dtos/site.dto";
import { SiteService } from "src/sites/application/services/site.service";
import { Site } from "src/sites/domain/models/site.model";

@Controller('api/sites')
export class SiteController extends BaseController<
    SiteService,
    SiteDto,
    SiteDto,
    SiteDto,
    SiteDto,
    Site,
    number> {
    constructor(private readonly siteService: SiteService) {
        super(siteService);
    }
}