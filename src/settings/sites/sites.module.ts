import { Module } from "@nestjs/common";
import { SiteRepository } from "./infrastructure/data/repositories/site.repository";
import { SiteService } from "./application/services/site.service";
import { SiteController } from "./presentation/controllers/site.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Site } from "./domain/models/site.model";

@Module({
    imports: [TypeOrmModule.forFeature([Site])],
    providers: [
        SiteRepository,
        SiteService
    ],
    controllers: [SiteController],
    exports: [SiteRepository]
})
export class SitesModule { }