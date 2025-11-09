import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { InspectionPhotoDto } from "../dtos/inspection-photo.dto";
import { InspectionPhoto } from "src/requests/domain/models/inspection-photo.model";
import { InspectionPhotoRepository } from "src/requests/infrastructure/data/repositories/inspection-photo.repository";

@Injectable()
export class InspectionPhotoService extends BaseService<
InspectionPhotoDto,
InspectionPhotoDto,
InspectionPhotoDto,
InspectionPhotoDto,
InspectionPhoto,
number> {
    constructor(private readonly inspectionPhotoRepository: InspectionPhotoRepository) {
        super(inspectionPhotoRepository);
    }
}