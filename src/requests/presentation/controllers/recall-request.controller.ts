import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { RecallRequestDto } from "src/requests/application/dtos/recall-request.dto";
import { RecallDto } from "src/requests/application/dtos/recall.dto";
import { RecallRequestService } from "src/requests/application/services/recall-request.service";
import { RecallRequestStatus } from "src/requests/domain/enums/recall-request-status.enum";
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

    @Get('get-all-by-status/:status')
    async getAllByStatus(@Param('status') status: RecallRequestStatus) {
        return this.recallRequestService.getAllByStatus(status);
    }

    @Get('get-user-recall-requests-by-shift/:userId/:shiftId')
    async getUserRecallRequestsByShift(
        @Param('userId') userId: number,
        @Param('shiftId') shiftId: number) {
        return this.recallRequestService.getUserRecallRequestsByShift(userId, shiftId);
    }

    @Patch('recall')
    async recall(@Body() recallDto: RecallDto) {
        return this.recallRequestService.recall(recallDto);
    }
}