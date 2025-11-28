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
import { PricingRepository } from "src/settings/pricings/infrastructure/data/repositories/pricing.repository";
import { GatePricingRepository } from "src/settings/gates-pricings/infrastructure/data/repositories/gate-pricing.repository";
import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
import { GenerateReceiptDto } from "../dtos/generate-receipt.dto";
import { PickupRequestGateway } from "src/requests/infrastructure/gateways/pickup-request.gateway";
import { PickupDto } from "../dtos/pickup.dto";
import { PricingType } from "src/settings/pricings/domain/enums/pricing-type.enum";
import { CustomerType } from "src/settings/customer-types/domain/models/customer-type.model";
import { Pricing } from "src/settings/pricings/domain/models/pricing.model";
import { GatePricing } from "src/settings/gates-pricings/domain/models/gate-pricing.model";
import { NoteRepository } from "src/notes/infrastructure/data/repositories/note.repository";
import { Note } from "src/notes/domain/models/note.model";
import { ReceiptRepository } from "src/receipts/infrastructure/data/repositories/receipt.repository";
import { ReceiptDto } from "src/receipts/application/dtos/receipt.dto";
import { Receipt } from "src/receipts/domain/models/receipt.model";
import { RequestSiteServiceRepository } from "src/requests-sites-services/infrastructure/data/repositories/request-site-service.repository";
import { RequestSiteService } from "src/requests-sites-services/domain/models/request-site-service.model";
import { NoteDto } from "src/notes/application/dtos/note.dto";

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
        private readonly noteRepository: NoteRepository,
        private readonly requestSiteServiceRepository: RequestSiteServiceRepository,
        private readonly receiptRepository: ReceiptRepository,
        private readonly inspectionPhotoService: InspectionPhotoService,
        private readonly fileManagementService: FileManagementService,
        private readonly pickupRequestGateway: PickupRequestGateway
    ) {
        super(pickupRequestRepository);
    }

    override async create(pickupRequestDto: PickupRequestDto): Promise<ResultDto<PickupRequestDto>> {
        return this.executeServiceCall(
            `Create ${PickupRequest.name} With Photos`,
            async () => {
                const pickupRequest = this.map(pickupRequestDto, PickupRequest);

                pickupRequest.startTime = new Date();
                pickupRequest.status = PickupRequestStatus.Created;

                await this.pickupRequestRepository.createAsync(pickupRequest);

                const saveFilesResult = await this.fileManagementService
                    .saveFiles(pickupRequestDto.inspectionPhotos, 'images');


                if (pickupRequestDto.inspectionPhotos && pickupRequestDto.inspectionPhotos.length > 0) {
                    const inspectionPhotos = saveFilesResult.files
                        .map(f => ({ id: 0, imagePath: f.path, pickupRequestId: pickupRequest!.id }));

                    this.inspectionPhotoService
                        .createRange(inspectionPhotos, InspectionPhoto);
                }

                if (pickupRequestDto.notes && pickupRequestDto.notes.length > 0)
                    await this.noteRepository.createRangeAsync(pickupRequestDto.notes
                        .map(noteDto => {
                            const note = new Note();

                            note.message = noteDto.message;
                            note.requestId = pickupRequest.id;
                            note.userId = noteDto.userId;

                            return note;
                        }));

                if (pickupRequestDto.requestSiteServices && pickupRequestDto.requestSiteServices.length > 0)
                    await this.requestSiteServiceRepository.createRangeAsync(
                        pickupRequestDto.requestSiteServices
                            .map(requestSiteServiceDto => {
                                const requestSiteService = new RequestSiteService();

                                requestSiteService.requestId = pickupRequest.id;
                                requestSiteService.siteId = requestSiteServiceDto.id.siteId;
                                requestSiteService.serviceId = requestSiteServiceDto.id.serviceId;
                                requestSiteService.status = requestSiteServiceDto.status;

                                return requestSiteService;
                            }));

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
                spec.addInclude(`requestSiteServices`);
                spec.addInclude(`notes`);

                const pickupRequest = await this.pickupRequestRepository.getAsync(id, spec)

                return this.map(pickupRequest, getDtoClass);
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
                pickupRequest.parkingLocation = updatePickupRequestStatusDto.parkingLocation;

                if (updatePickupRequestStatusDto.notes &&
                    updatePickupRequestStatusDto.notes.length > 0)
                    await this.noteRepository.createRangeAsync(updatePickupRequestStatusDto.notes
                        .map(noteDto => {
                            const note = new Note();

                            note.message = noteDto.message;
                            note.requestId = pickupRequest!.id;
                            note.userId = noteDto.userId;

                            return note;
                        }));

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

    async generateReceipt(generateReceiptDto: GenerateReceiptDto): Promise<ResultDto<ReceiptDto>> {
        return this.executeServiceCall(
            'Generate Request Receipt',
            async () => {
                const pickupRequestSpec = new BaseSpecification();

                pickupRequestSpec.addInclude('requestSiteServices.siteService');

                const pickupRequest = await this.pickupRequestRepository
                    .getAsync(generateReceiptDto.pickupRequestId, pickupRequestSpec);

                if (!pickupRequest) throw new NotFoundException('Pickup Request Not Found');

                if (!generateReceiptDto.endTime) throw new BadRequestException('End Time is missing');

                const receiptDto = new ReceiptDto();

                if (pickupRequest.receiptId) {
                    const receipt = await this.receiptRepository.getAsync(pickupRequest.receiptId);
                    const receiptDto = this.map(receipt, ReceiptDto);

                    receiptDto.plateNumber = pickupRequest.plateNumber;
                    receiptDto.startTime = pickupRequest.startTime;
                    receiptDto.endTime = pickupRequest.endTime;

                    return receiptDto;
                }

                const day = new Date(generateReceiptDto.endTime).getDay();
                const gatePricingSpec = new BaseSpecification();

                gatePricingSpec.addInclude('pricing');
                gatePricingSpec.addInclude('pricing.weekDayPricings');
                gatePricingSpec.addCriteria(`"customerTypeId" = ${pickupRequest.customerTypeId} AND "gateId" = ${generateReceiptDto.gateId} AND weekDayPricings.dayOfWeek = '${day}'`);
                gatePricingSpec.addOrderByDescending('pricing.order');

                const gatePricings = await this.gatePricingRepository.getAllAsync(gatePricingSpec);
                const pricingSpec = new BaseSpecification();

                pricingSpec.addInclude('weekDayPricings');
                pricingSpec.addCriteria(`("customerTypeId" = ${pickupRequest.customerTypeId} OR "customerTypeId" IS NULL) AND ("order" = 1 OR weekDayPricings.dayOfWeek = '${day}')`);
                pricingSpec.addOrderByDescending('pricing.order');

                const pricings = await this.pricingRepository.getAllAsync(pricingSpec);

                if (!pricings?.length) throw Error('There are no defined pricings');

                const gatePricing = gatePricings.length ? gatePricings[0] : null;
                const valetPricing = this.resolveValetPricing(gatePricing, pricings);
                const parkingPricing = this.resolveParkingPricing(gatePricing, pricings);

                receiptDto.plateNumber = pickupRequest.plateNumber;
                receiptDto.startTime = pickupRequest.startTime;
                receiptDto.endTime = generateReceiptDto.endTime;

                const start = new Date(pickupRequest.startTime);
                const end = new Date(generateReceiptDto.endTime);
                const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));

                receiptDto.valet = this.calculatePricingForDuration(
                    valetPricing.pricingType,
                    totalHours,
                    valetPricing.freeHours,
                    valetPricing.hourlyRate,
                    valetPricing.dailyRate,
                    valetPricing.dailyMaxRate
                );

                receiptDto.parking = parkingPricing.parkingEnabled
                    ? this.calculatePricingForDuration(
                        parkingPricing.parkingPricingType,
                        totalHours,
                        parkingPricing.parkingFreeHours ?? 0,
                        parkingPricing.parkingHourlyRate,
                        parkingPricing.parkingDailyRate,
                        parkingPricing.dailyMaxRate
                    )
                    : 0;

                receiptDto.extraServices = pickupRequest.requestSiteServices
                    ?.reduce((sum, x) => sum + (x.siteService?.amount ?? 0), 0) ?? 0;

                const receipt = this.map(receiptDto, Receipt);

                receipt.tax = 0;
                receipt.requestId = pickupRequest.id;

                await this.receiptRepository.createAsync(receipt);

                pickupRequest.receiptId = receipt.id;

                await this.pickupRequestRepository.updateAsync(pickupRequest);

                return receiptDto;
            }
        );
    }

    private resolveValetPricing(
        gatePricing: GatePricing | null,
        pricings: Pricing[]
    ): Pricing {
        if (gatePricing?.enableValetPricing) {
            return gatePricing.pricing;
        }

        const gateOrder = gatePricing?.pricing?.order ?? Infinity;

        for (const p of pricings) {
            if (p.order < gateOrder) {
                return p;
            }
        }

        return pricings[pricings.length - 1];
    }

    private resolveParkingPricing(
        gatePricing: GatePricing | null,
        pricings: Pricing[]
    ): Pricing {
        if (gatePricing?.enableParkingPricing) {
            return gatePricing.pricing;
        }

        const gateOrder = gatePricing?.pricing?.order ?? Infinity;

        for (const p of pricings) {
            if (p.order < gateOrder) {
                return p;
            }
        }

        return pricings[pricings.length - 1];
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