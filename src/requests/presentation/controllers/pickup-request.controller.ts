import { Controller } from "@nestjs/common";
import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { PickupRequestService } from "src/requests/application/services/pickup-request.service";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
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
}