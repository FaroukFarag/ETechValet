import { Controller, Delete, Get, Param } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { SiteServiceService } from "../../application/services/site-service.service";
import { SiteServiceDto } from "../../application/dtos/site-service.dto";
import { SiteService } from "../../domain/models/site-service.model";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Controller('api/sites-services')
export class SiteServiceController extends BaseController<
    SiteServiceService,
    SiteServiceDto,
    SiteServiceDto,
    SiteServiceDto,
    SiteServiceDto,
    SiteService,
    { siteId: number, serviceId: number }> {
    constructor(private readonly siteServiceService: SiteServiceService) {
        super(siteServiceService);
    }

    @Get('get/:siteId/:serviceId')
    override async get(
        @Param() id: { siteId: number, serviceId: number },
    ): Promise<ResultDto<SiteServiceDto>> {
        return this.siteServiceService.getById(id, SiteService, SiteServiceDto);
    }

    @Delete('delete/:siteId/:serviceId')
    override async delete(
        @Param() id: { siteId: number, serviceId: number }
    ): Promise<ResultDto<SiteServiceDto>> {
        return this.siteServiceService.delete(id, SiteService, SiteServiceDto);
    }
}