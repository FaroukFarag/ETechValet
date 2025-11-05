import { Controller } from "@nestjs/common";
import { CompanyDto } from "src/companies/application/dtos/company.dto";
import { CompanyService } from "src/companies/application/services/company.service";
import { Company } from "src/companies/domain/models/company.model";
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