import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RequestSiteService } from "./domain/models/request-site-service.model";
import { RequestSiteServiceRepository } from "./infrastructure/data/repositories/request-site-service.repository";
import { RequestSiteServiceService } from "./application/services/request-site-service.service";
import { RequestSiteServiceController } from "./presentation/controllers/request-site-service.controller";

@Module({
    imports: [TypeOrmModule.forFeature([RequestSiteService])],
    providers: [RequestSiteServiceRepository, RequestSiteServiceService],
    controllers: [RequestSiteServiceController]
})
export class RequestsSitesServicesModule { }