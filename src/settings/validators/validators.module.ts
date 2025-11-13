import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Validator } from "./domain/models/validator.model";
import { ValidatorRepository } from "./infrastructure/data/validator.repository";
import { ValidatorService } from "./application/services/validator.service";
import { ValidatorController } from "./presentation/controllers/validator.controller";
import { SitesServicesValidatorsModule } from "../sites-services-validators/sites-services-validators.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Validator]),
        SitesServicesValidatorsModule
    ],
    providers: [ValidatorRepository, ValidatorService],
    controllers: [ValidatorController]
})
export class ValidatorsModule { }