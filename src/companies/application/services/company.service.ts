import { Injectable } from "@nestjs/common";
import { Company } from "src/companies/domain/models/company.model";
import { BaseService } from "src/shared/application/services/base.service";
import { CompanyDto } from "../dtos/company.dto";
import { CompanyRepository } from "src/companies/infrastructure/data/repositories/company.repository";

@Injectable()
export class CompanyService extends BaseService<
    CompanyDto,
    CompanyDto,
    CompanyDto,
    CompanyDto,
    Company,
    number> {
    constructor(private readonly companyRepository: CompanyRepository) {
        super(companyRepository);
    }
}