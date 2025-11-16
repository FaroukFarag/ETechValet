import { Body, Controller, Patch, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { UpdatePickupRequestStatusDto } from "src/requests/application/dtos/update-pickup-request-status.dto";
import { PickupRequestService } from "src/requests/application/services/pickup-request.service";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/pickup-requests')
export class PickupRequestController extends BaseController<
    PickupRequestService,
    PickupRequestDto,
    PickupRequestDto,
    PickupRequestDto,
    PickupRequestDto,
    PickupRequest,
    number> {
    constructor(private readonly pickupRequestService: PickupRequestService) {
        super(pickupRequestService);
    }

    @Post('create-with-photos')
    @UseInterceptors(FilesInterceptor('inspectionPhotos'))
    async createWithPhotos(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() pickupRequestDto: PickupRequestDto
    ): Promise<ResultDto<PickupRequestDto>> {
        return this.pickupRequestService.createWithPhotos(pickupRequestDto, files);
    }

    @Patch('update-request-status')
    async updateRequestServiceStatus(updateRequestStatusDto: UpdatePickupRequestStatusDto) {
        return this.pickupRequestService.updatePickupRequestStatus(updateRequestStatusDto);
    }
}