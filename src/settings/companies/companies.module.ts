import { Module } from "@nestjs/common";
import { CompanyRepository } from "./infrastructure/data/repositories/company.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "./domain/models/company.model";
import { CompanyService } from "./application/services/company.service";
import { CompanyController } from "./presentation/controllers/company.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Company])],
    providers: [CompanyRepository, CompanyService],
    controllers: [CompanyController]
})
export class CompaniesModule { }