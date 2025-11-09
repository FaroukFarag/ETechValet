import { Controller } from "@nestjs/common";
import { InspectionPhotoDto } from "src/requests/application/dtos/inspection-photo.dto";
import { InspectionPhotoService } from "src/requests/application/services/inspection-photo.service";
import { InspectionPhoto } from "src/requests/domain/models/inspection-photo.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/inspection-photos')
export class InspectionPhotoController extends BaseController<
    InspectionPhotoService,
    InspectionPhotoDto,
    InspectionPhotoDto,
    InspectionPhotoDto,
    InspectionPhotoDto,
    InspectionPhoto,
    number> {
    constructor(private readonly inspectionPhotoService: InspectionPhotoService) {
        super(inspectionPhotoService);
    }
}