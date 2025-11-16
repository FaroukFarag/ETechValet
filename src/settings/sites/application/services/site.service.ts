import { Injectable } from "@nestjs/common";
import { SiteDto } from "../dtos/site.dto";
import { BaseService } from "src/shared/application/services/base.service";
import { Site } from "src/settings/sites/domain/models/site.model";
import { SiteRepository } from "src/settings/sites/infrastructure/data/repositories/site.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Injectable()
export class SiteService extends BaseService<
    SiteDto,
    SiteDto,
    SiteDto,
    SiteDto,
    Site,
    number> {
    constructor(private readonly siteRepository: SiteRepository) {
        super(siteRepository);
    }

    override async getAll(entityClass: new () => Site, getAllDtoClass: new () => SiteDto): Promise<ResultDto<SiteDto[]>> {
        return this.executeServiceCall(
            'Get All Sites',
            async () => {
                const sites = await this.siteRepository
                    .getAllProjectedAsync([
                        "id", "name", "company.name as companyName", "valueType",
                        "fixedValue", "percentage", "address",
                        "status"]);

                return this.mapArray(sites, getAllDtoClass);
            }
        );
    }
}