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
import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
import { GenerateReceiptDto } from "../dtos/generate-receipt.dto";
import { PickupRequestGateway } from "src/requests/infrastructure/gateways/pickup-request.gateway";
import { PickupDto } from "../dtos/pickup.dto";

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
        private readonly inspectionPhotoService: InspectionPhotoService,
        private readonly fileManagementService: FileManagementService,
        private readonly pickupRequestGateway: PickupRequestGateway
    ) {
        super(pickupRequestRepository);
    }

    async createWithPhotos(pickupRequestDto: PickupRequestDto, files: Express.Multer.File[]): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            `Create ${PickupRequest.name} With Photos`,
            async () => {
                const pickupRequest = this.map(pickupRequestDto, PickupRequest);

                pickupRequest.startTime = new Date();
                pickupRequest.status = PickupRequestStatus.Created;

                await this.pickupRequestRepository.createAsync(pickupRequest);

                const saveFilesResult = await this.fileManagementService
                    .saveFiles('images', files);


                if (pickupRequestDto.inspectionPhotos && pickupRequestDto.inspectionPhotos.length > 0) {
                    pickupRequestDto.inspectionPhotos = saveFilesResult.files
                        .map(f => ({ id: 0, imagePath: f.path, pickupRequestId: pickupRequest!.id }));

                    this.inspectionPhotoService
                        .createRange(pickupRequestDto.inspectionPhotos, InspectionPhoto);
                }

                this.pickupRequestGateway.notifyPickupRequestCreated(
                    this.map(pickupRequest, PickupRequestDto),
                );

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

    async getAllByStatus(status: PickupRequestStatus): Promise<ResultDto<PickupRequestDto[]>> {
        return this.executeServiceCall(
            'Get All Pickup Request By Status',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`status = '${status}'`);

                return this.mapArray(await this.pickupRequestRepository.getAllAsync(spec), PickupRequestDto);
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

    async pickup(pickupDto: PickupDto): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            'Pickup',
            async () => {
                const pickupRequest = await this.pickupRequestRepository.getAsync(pickupDto.pickupRequestId);

                if (!pickupRequest) throw new NotFoundException('Pickup Request Not Found');

                if (pickupRequest.status === PickupRequestStatus.PickedUp)
                    throw new Error('This Request Already Picked Up');

                pickupRequest.status = PickupRequestStatus.PickedUp;
                pickupRequest.parkedById = pickupDto.parkedById;

                await this.pickupRequestRepository.updateAsync(pickupRequest);

                return this.map(pickupRequest, PickupRequestDto);
            }
        );
    }

    async generateReceipt(generateReceiptDto: GenerateReceiptDto): Promise<ResultDto<PickupRequestReceiptDto>> {
        return this.executeServiceCall(
            'Generate Request Receipt',
            async () => {
                const pickupRequest = await this.pickupRequestRepository.getAsync(generateReceiptDto.pickupRequestId);

                if (!pickupRequest) throw new NotFoundException('Pickup Request Not Found');

                if (!generateReceiptDto.endTime) throw new BadRequestException('End Time is missing');

                const day = new Date(generateReceiptDto.endTime).getDay();
                const pickupRequestReceiptDto = new PickupRequestReceiptDto();
                const gatePricingSpec = new BaseSpecification();

                gatePricingSpec.addInclude('pricing');
                gatePricingSpec.addInclude('pricing.weekDayPricings');

                gatePricingSpec.addCriteria(`"gateId" = ${generateReceiptDto.gateId} AND weekDayPricings.dayOfWeek = '${day}'`);
                gatePricingSpec.addOrderByDescending('pricing.order');

                const gatePricings = await this.gatePricingRepository.getAllAsync(gatePricingSpec);

                return pickupRequestReceiptDto;
            }
        );
    }
}