import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SiteService } from "./domain/models/site-service.model";
import { SiteServiceRepository } from "./infrastructure/data/repositories/site-service.repository";
import { SiteServiceController } from "./presentation/controllers/site-service.controller";
import { SiteServiceService } from "./application/services/site-service.service";

@Module({
    imports: [TypeOrmModule.forFeature([SiteService])],
    providers: [SiteServiceRepository, SiteServiceService],
    controllers: [SiteServiceController]
})
export class SitesServicesModule { }