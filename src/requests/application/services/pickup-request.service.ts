import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { BaseService } from "src/shared/application/services/base.service";
import { PickupRequestDto } from "../dtos/pickup-request.dto";
import { PickupRequestRepository } from "src/requests/infrastructure/data/repositories/pickup-request.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { FileManagementService } from "src/shared/application/services/file-management.service";
import { InspectionPhotoService } from "./inspection-photo.service";
import { InspectionPhoto } from "src/requests/domain/models/inspection-photo.model";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { UpdatePickupRequestStatusDto } from "../dtos/update-pickup-request-status.dto";
import { PickupRequestReceiptDto } from "../dtos/pickup-request-receipt.dto";
import { PricingRepository } from "src/settings/pricings/infrastructure/data/repositories/pricing.repository";
import { WeekDayPricingRepository } from "src/settings/pricings/infrastructure/data/repositories/week-day-pricing.repository";
import { GatePricingRepository } from "src/settings/gates-pricings/infrastructure/data/repositories/gate-pricing.repository";

@Injectable()
export class PickupRequestService extends BaseService<
    PickupRequestDto,
    PickupRequestDto,
    PickupRequestDto,
    PickupRequestDto,
    PickupRequest,
    number> {
    constructor(
        private readonly pickupRequestRepository: PickupRequestRepository,
        private readonly gatePricingRepository: GatePricingRepository,
        private readonly pricingRepository: PricingRepository,
        private readonly weekDayPricingRepository: WeekDayPricingRepository,
        private readonly inspectionPhotoService: InspectionPhotoService,
        private readonly fileManagementService: FileManagementService) {
        super(pickupRequestRepository);
    }

    async createWithPhotos(pickupRequestDto: PickupRequestDto, files: Express.Multer.File[]): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            `Create ${PickupRequest.name} With Photos`,
            async () => {
                const pickupRequest = this.map(pickupRequestDto, PickupRequest);

                pickupRequest.startTime = new Date();

                await this.pickupRequestRepository.createAsync(pickupRequest);

                const saveFilesResult = await this.fileManagementService
                    .saveFiles('images', files);


                pickupRequestDto.inspectionPhotos = saveFilesResult.files
                    .map(f => ({ id: 0, imagePath: f.path, pickupRequestId: pickupRequest!.id }));

                this.inspectionPhotoService
                    .createRange(pickupRequestDto.inspectionPhotos, InspectionPhoto);

                return this.map(pickupRequest, PickupRequestDto);
            }
        );
    }

    override async getById(id: number, entityClass: new () => PickupRequest, getDtoClass: new () => PickupRequestDto): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            'Get Pickup Request',
            async () => {
                const spec = new BaseSpecification();

                spec.addInclude(`inspectionPhotos`);

                return this.map(this.pickupRequestRepository.getAsync(id, spec), getDtoClass);
            }
        )
    }

    async updatePickupRequestStatus(updatePickupRequestStatusDto: UpdatePickupRequestStatusDto): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            'Update Pickup Request Status',
            async () => {
                let pickupRequest = await this.pickupRequestRepository.getAsync(updatePickupRequestStatusDto.id);

                if (!pickupRequest) throw new NotFoundException("Pickup Request not found");

                pickupRequest.status = updatePickupRequestStatusDto.status;

                if (updatePickupRequestStatusDto.notes)
                    pickupRequest.notes = updatePickupRequestStatusDto.notes

                pickupRequest = await this.pickupRequestRepository.updateAsync(pickupRequest);

                return this.map(pickupRequest, PickupRequestDto)
            }
        )
    }

    async generateReceipt(pickupRequestDto: PickupRequestDto): Promise<ResultDto<PickupRequestReceiptDto>> {
        return this.executeServiceCall(
            'Generate Request Receipt',
            async () => {
                if(!pickupRequestDto.endTime) throw new BadRequestException('End Time is missing');

                const day = pickupRequestDto.endTime!.getDay();
                const pickupRequestReceiptDto = new PickupRequestReceiptDto();
                const gatePricingSpec = new BaseSpecification();

                gatePricingSpec.addCriteria(`"gateId" = ${pickupRequestDto.gateId}`)
                gatePricingSpec.addOrderByDescending('pricing.order');

                const gatePricings = await this.gatePricingRepository.getAllAsync(gatePricingSpec);

                return pickupRequestReceiptDto;
            }
        );
    }
}