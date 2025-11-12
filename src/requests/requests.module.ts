import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PickupRequest } from "./domain/models/pickup-request.model";
import { RecallRequest } from "./domain/models/recall-request.model";
import { InspectionPhoto } from "./domain/models/inspection-photo.model";
import { PickupRequestRepository } from "./infrastructure/data/repositories/pickup-request.repository";
import { RecallRequestRepository } from "./infrastructure/data/repositories/recall-request.repository";
import { InspectionPhotoRepository } from "./infrastructure/data/repositories/inspection-photo.repository";
import { PickupRequestService } from "./application/services/pickup-request.service";
import { RecallRequestService } from "./application/services/recall-request.service";
import { InspectionPhotoService } from "./application/services/inspection-photo.service";
import { InspectionPhotoController } from "./presentation/controllers/inspection-photo.controller";
import { PickupRequestController } from "./presentation/controllers/pickup-request.controller";
import { RecallRequestController } from "./presentation/controllers/recall-request.controller";
import { MulterModule } from "@nestjs/platform-express";
import { FileManagementService } from "src/shared/application/services/file-management.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PickupRequest, RecallRequest, InspectionPhoto]),
        MulterModule.register({
            dest: './uploads',
        })],
    providers: [
        PickupRequestRepository,
        RecallRequestRepository,
        InspectionPhotoRepository,
        PickupRequestService,
        RecallRequestService,
        InspectionPhotoService,
        FileManagementService
    ],
    controllers: [
        PickupRequestController,
        RecallRequestController,
        InspectionPhotoController
    ]
})
export class RequestsModule { }