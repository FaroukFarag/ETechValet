import { Injectable, NotFoundException } from "@nestjs/common";
import { RecallRequest } from "src/requests/domain/models/recall-request.model";
import { BaseService } from "src/shared/application/services/base.service";
import { RecallRequestRepository } from "src/requests/infrastructure/data/repositories/recall-request.repository";
import { RecallRequestDto } from "../dtos/recall-request.dto";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { PickupRequestRepository } from "src/requests/infrastructure/data/repositories/pickup-request.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { RecallRequestGateway } from "src/requests/infrastructure/gateways/recall-request.gateway";
import { RecallRequestStatus } from "src/requests/domain/enums/recall-request-status.enum";
import { read } from "fs";
import { RecallDto } from "../dtos/recall.dto";
import { RequestSiteServiceStatus } from "src/requests-sites-services/domain/enums/request-site-service-status.enum";

@Injectable()
export class RecallRequestService extends BaseService<
    RecallRequestDto,
    RecallRequestDto,
    RecallRequestDto,
    RecallRequestDto,
    RecallRequest,
    number> {
    constructor(
        private readonly recallRequestRepository: RecallRequestRepository,
        private readonly pickupRequestRepository: PickupRequestRepository,
        private readonly recallRequestGateway: RecallRequestGateway
    ) {
        super(recallRequestRepository);
    }

    override async create(
        recallRequestDto: RecallRequestDto,
        recallRequestClass: new () => RecallRequest
    ): Promise<ResultDto<RecallRequestDto>> {

        return this.executeServiceCall(
            `Create ${recallRequestClass.name}`,
            async () => {
                const recallRequest = this.map(recallRequestDto, recallRequestClass);
                const pickupRequest = recallRequestDto.pickupRequest;
                const spec = new BaseSpecification();

                if (!pickupRequest) throw new Error("Car details are missing")

                spec.addCriteria(`"plateNumber" = '${pickupRequest.plateNumber}' AND "plateType" = ${pickupRequest.plateType}`);
                spec.addInclude('requestSiteServices');
                spec.addOrderByDescending('id');

                const pickupRequests = await this.pickupRequestRepository.getAllAsync(spec);
                const latestPickupRequest = pickupRequests[0] ?? null;

                if (!latestPickupRequest || latestPickupRequest.recallRequestId)
                    throw new Error(`No such car with this plate number ${pickupRequest.plateNumber}`);

                if (!recallRequestDto.skipServices && latestPickupRequest.requestSiteServices?.some(
                    rss => rss.status !== RequestSiteServiceStatus.Completed))
                    throw new Error(`Extra services for this car not finished yet`);

                recallRequest.pickupRequestId = latestPickupRequest.id;

                await this.recallRequestRepository.createAsync(recallRequest);

                this.recallRequestGateway.notifyRecallRequestCreated(
                    this.map(recallRequest, RecallRequestDto),
                );

                latestPickupRequest.recallRequestId = recallRequest.id;
                latestPickupRequest.endTime = new Date();

                await this.pickupRequestRepository.updateAsync(latestPickupRequest);

                return this.map(recallRequest, RecallRequestDto);
            },
        );
    }

    override async getById(id: number, entityClass: new () => RecallRequest, getDtoClass: new () => RecallRequestDto): Promise<ResultDto<RecallRequestDto>> {
        return this.executeServiceCall(
            'Get Recall Request',
            async () => {
                const spec = new BaseSpecification();

                spec.addInclude(`pickupRequest`);
                spec.addInclude(`gate`);
                spec.addInclude(`pickupRequest.inspectionPhotos`);
                spec.addInclude(`pickupRequest.requestSiteServices`);

                const recallRequest = await this.recallRequestRepository.getAsync(id, spec)

                return this.map(recallRequest, getDtoClass);
            }
        )
    }

    async getAllByStatus(status: RecallRequestStatus): Promise<ResultDto<RecallRequestDto[]>> {
        return this.executeServiceCall(
            'Get All Recall Requests By Status',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`recall_request.status = '${status}'`);
                spec.addInclude('gate');
                spec.addInclude('pickupRequest');

                return this.mapArray(await this.recallRequestRepository.getAllAsync(spec), RecallRequestDto);
            }
        )
    }

    async getUserRecallRequestsByShift(userId: number, shiftId: number):
        Promise<ResultDto<number>> {
        return this.executeServiceCall(
            'Get User Recall Requests By Shift',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`"recalledById" = ${userId} AND pickupRequest.shiftId = ${shiftId}`);
                spec.addInclude('pickupRequest');

                return await this.recallRequestRepository.getCountAsync(spec);
            }
        )
    }

    async getTotalRequests(startTime?: Date, endTime?: Date): Promise<ResultDto<number>> {
        return this.executeServiceCall(
            'Get Total Requests',
            async () => {
                const spec = new BaseSpecification();
                let criteria = '';

                if (startTime && endTime) {
                    criteria = `"recalledAt" BETWEEN '${startTime}' AND '${endTime}'`;
                }

                else if (startTime) {
                    criteria = `"recalledAt" >= '${startTime}'`;
                }

                else if (endTime) {
                    criteria = `"recalledAt" <= '${endTime}'`;
                }

                spec.addCriteria(criteria);

                return await this.recallRequestRepository.getCountAsync(spec);
            }
        );
    }

    async recall(recallDto: RecallDto): Promise<ResultDto<RecallRequestDto>> {
        return this.executeServiceCall(
            'Recall',
            async () => {
                const recallRequest = await this.recallRequestRepository.getAsync(recallDto.recallRequestId);

                if (!recallRequest) throw new NotFoundException('Recall Request Not Found');

                if (recallRequest.status === RecallRequestStatus.Completed)
                    throw new Error('This Request Already Delivered');

                recallRequest.status = RecallRequestStatus.Completed;
                recallRequest.deliveredById = recallDto.deliveredById;

                await this.recallRequestRepository.updateAsync(recallRequest);

                return this.map(recallRequest, RecallRequestDto);
            }
        );
    }
}