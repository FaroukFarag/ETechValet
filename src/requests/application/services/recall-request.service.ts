import { Injectable } from "@nestjs/common";
import { RecallRequest } from "src/requests/domain/models/recall-request.model";
import { BaseService } from "src/shared/application/services/base.service";
import { RecallRequestRepository } from "src/requests/infrastructure/data/repositories/recall-request.repository";
import { RecallRequestDto } from "../dtos/recall-request.dto";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { PickupRequestRepository } from "src/requests/infrastructure/data/repositories/pickup-request.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";

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
        private readonly pickupRequestRepository: PickupRequestRepository
    ) {
        super(recallRequestRepository);
    }

    override async create(recallRequestDto: RecallRequestDto,
        recallRequestClass: new () => RecallRequest): Promise<ResultDto<RecallRequestDto>> {

        return this.executeServiceCall(
            `Create ${recallRequestClass.name}`,
            async () => {
                const recallRequest = this.map(recallRequestDto, recallRequestClass);
                const spec = new BaseSpecification();

                spec.addCriteria(`"plateNumber" = '${recallRequest.plateNumber}' AND "plateType" = ${recallRequest.plateType}`);
                spec.addOrderByDescending('id');

                const pickupRequests = await this.pickupRequestRepository.getAllAsync(spec);
                const latestPickupRequest = pickupRequests[0] ?? null;

                if (!latestPickupRequest || latestPickupRequest.recallRequestId)
                    throw new Error(`No such car with this plate number ${recallRequest.plateNumber}`);

                recallRequest.pickupRequestId = latestPickupRequest.id;

                await this.recallRequestRepository.createAsync(recallRequest);

                latestPickupRequest.recallRequestId = recallRequest.id;

                await this.pickupRequestRepository.updateAsync(latestPickupRequest);

                return recallRequestDto;
            },
        );
    }
}