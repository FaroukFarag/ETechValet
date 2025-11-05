import { Controller } from "@nestjs/common";
import { CompanyDto } from "src/settings/companies/application/dtos/company.dto";
import { CompanyService } from "src/settings/companies/application/services/company.service";
import { Company } from "src/settings/companies/domain/models/company.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/companies')
export class CompanyController extends BaseController<
    CompanyService,
    CompanyDto,
    CompanyDto,
    CompanyDto,
    CompanyDto,
    Company,
    number> {
        constructor(private readonly companyService: CompanyService) {
            super(companyService);
        }
    }