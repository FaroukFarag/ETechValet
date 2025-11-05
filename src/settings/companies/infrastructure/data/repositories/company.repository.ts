import { Injectable } from "@nestjs/common";
import { Company } from "src/settings/companies/domain/models/company.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class CompanyRepository extends BaseRepository<Company, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Company);
    }
}