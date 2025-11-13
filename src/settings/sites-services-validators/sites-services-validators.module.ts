import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiteServiceValidator } from "./domain/models/site-service-validator.model";
import { SiteServiceValidatorRepository } from "./infrastructure/data/repositories/site-service-validator.repository";
import { SiteServiceValidatorService } from "./application/services/site-service-validator.service";
import { SiteServiceValidatorController } from "./presentation/controllers/site-service-validator.controller";

@Module({
    imports: [TypeOrmModule.forFeature([SiteServiceValidator])],
    providers: [SiteServiceValidatorRepository, SiteServiceValidatorService],
    controllers: [SiteServiceValidatorController],
    exports: [SiteServiceValidatorRepository]
})
export class SitesServicesValidatorsModule { }