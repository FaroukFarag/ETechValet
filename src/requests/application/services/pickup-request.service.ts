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
import { CustomerType } from "src/settings/pricings/domain/enums/customer-type.enum";
import { Pricing } from "src/settings/pricings/domain/models/pricing.model";
import { PricingType } from "src/settings/pricings/domain/enums/pricing-type.enum";

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

    async getTotalParkedRequests(startTime?: Date, endTime?: Date): Promise<ResultDto<number>> {
        return this.executeServiceCall(
            'Get Total Parked Requests',
            async () => {
                const spec = new BaseSpecification();
                let criteria = '';

                if (startTime && endTime) {
                    criteria = `"startTime" BETWEEN '${startTime}' AND '${endTime}' AND status = '${PickupRequestStatus.Parked}'`;
                }

                else if (startTime) {
                    criteria = `"startTime" >= '${startTime}' AND status = '${PickupRequestStatus.Parked}'`;
                }

                else if (endTime) {
                    criteria = `"startTime" <= '${endTime}' AND status = '${PickupRequestStatus.Parked}'`;
                }

                else {
                    criteria = `status = '${PickupRequestStatus.Parked}'`;
                }

                spec.addCriteria(criteria);

                return await this.pickupRequestRepository.getCountAsync(spec);
            }
        );
    }

    async getTopCustomerType(startTime?: Date, endTime?: Date):
        Promise<ResultDto<{ customerType: CustomerType; requestCount: number } | null>> {
        return this.executeServiceCall(
            'Get Customer Type With Max Requests',
            async () => {
                return await this.pickupRequestRepository.getTopCustomerType(startTime, endTime);
            }
        )
    }

    async getAverageParkingTime(startTime?: Date, endTime?: Date): Promise<ResultDto<number>> {
        return this.executeServiceCall(
            'Get Average Parking Time',
            async () => {
                return await this.pickupRequestRepository
                    .getAverageParkingHours(startTime, endTime);
            }
        );
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
        );
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
                const pickupRequestSpec = new BaseSpecification();

                pickupRequestSpec.addInclude('requestSiteServices.siteService');

                const pickupRequest = await this.pickupRequestRepository
                    .getAsync(generateReceiptDto.pickupRequestId, pickupRequestSpec);

                if (!pickupRequest) throw new NotFoundException('Pickup Request Not Found');

                if (!generateReceiptDto.endTime) throw new BadRequestException('End Time is missing');

                const day = new Date(generateReceiptDto.endTime).getDay();
                const gatePricingSpec = new BaseSpecification();

                gatePricingSpec.addInclude('pricing');
                gatePricingSpec.addInclude('pricing.weekDayPricings');

                gatePricingSpec.addCriteria(`"customerType" = '${pickupRequest.customerType}' AND "gateId" = ${generateReceiptDto.gateId} AND weekDayPricings.dayOfWeek = '${day}'`);
                gatePricingSpec.addOrderByDescending('pricing.order');

                const gatePricings = await this.gatePricingRepository.getAllAsync(gatePricingSpec);
                const pricingSpec = new BaseSpecification();

                pricingSpec.addInclude('weekDayPricings');

                pricingSpec.addCriteria(`"customerType" = '${pickupRequest.customerType}' AND weekDayPricings.dayOfWeek = '${day}'`);
                pricingSpec.addOrderByDescending('pricing.order');

                const pricings = await this.pricingRepository.getAllAsync(pricingSpec);

                if (!pricings || pricings.length == 0)
                    throw Error('There are no defined pricings')

                    const pricing = gatePricings && gatePricings.length > 0 ?
                        gatePricings[0].pricing : pricings[0];
                const pickupRequestReceiptDto = new PickupRequestReceiptDto();

                pickupRequestReceiptDto.plateNumber = pickupRequest.plateNumber;
                pickupRequestReceiptDto.startTime = pickupRequest.startTime;
                pickupRequestReceiptDto.endTime = generateReceiptDto.endTime;

                const start = new Date(pickupRequest.startTime);
                const end = new Date(generateReceiptDto.endTime);
                const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));

                pickupRequestReceiptDto.valet = this.calculatePricingForDuration(
                    pricing.pricingType,
                    totalHours,
                    pricing.freeHours,
                    pricing.hourlyRate,
                    pricing.dailyRate,
                    pricing.dailyMaxRate
                );

                if (pricing.parkingEnabled) {
                    pickupRequestReceiptDto.fee = this.calculatePricingForDuration(
                        pricing.parkingPricingType,
                        totalHours,
                        pricing.parkingFreeHours ?? 0,
                        pricing.parkingHourlyRate,
                        pricing.parkingDailyRate,
                        pricing.dailyMaxRate
                    );
                }

                const sumServices = pickupRequest.requestSiteServices?.reduce((sum, s) => sum + s?.siteService?.amount, 0) ?? 0;

                pickupRequestReceiptDto.extraServices = sumServices;

                return pickupRequestReceiptDto;
            }
        );
    }

    private calculatePricingForDuration(
        pricingType: PricingType,
        totalHours: number,
        freeHours: number,
        hourlyRate: number,
        dailyRate: number,
        dailyMaxRate: number
    ): number {
        if (pricingType === PricingType.fixedAmount) {
            return dailyRate ?? 0;
        }

        if (totalHours <= freeHours) return 0;

        let payableHours = totalHours - freeHours;
        let total = 0;

        while (payableHours > 0) {
            let hoursToday = Math.min(payableHours, 24);
            let todayAmount = hoursToday * hourlyRate;

            if (dailyMaxRate && todayAmount > dailyMaxRate) {
                todayAmount = dailyMaxRate;
            }

            total += todayAmount;
            payableHours -= hoursToday;
        }

        return +total;
    }

}