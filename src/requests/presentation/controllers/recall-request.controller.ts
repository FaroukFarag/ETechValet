import { Controller } from "@nestjs/common";
import { RecallRequestDto } from "src/requests/application/dtos/recall-request.dto";
import { RecallRequestService } from "src/requests/application/services/recall-request.service";
import { RecallRequest } from "src/requests/domain/models/recall-request.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/recall-requests')
export class RecallRequestController extends BaseController<
    RecallRequestService,
    RecallRequestDto,
    RecallRequestDto,
    RecallRequestDto,
    RecallRequestDto,
    RecallRequest,
    number> {
    constructor(private readonly recallRequestService: RecallRequestService) {
        super(recallRequestService);
    }
}