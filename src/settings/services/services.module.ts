import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Service } from "./domain/models/service.model";
import { ServiceRepository } from "./infrastructure/data/repositories/service.repository";
import { ServiceService } from "./application/services/service.service";
import { ServiceController } from "./presentation/controllers/service.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Service])],
    providers: [ServiceRepository, ServiceService],
    controllers: [ServiceController]
})
export class ServicesModule { }