import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { GenerateReceiptDto } from "src/requests/application/dtos/generate-receipt.dto";
import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { PickupDto } from "src/requests/application/dtos/pickup.dto";
import { UpdatePickupRequestStatusDto } from "src/requests/application/dtos/update-pickup-request-status.dto";
import { PickupRequestService } from "src/requests/application/services/pickup-request.service";
import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
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

    @Get('get-all-by-status/:status')
    async getAllByStatus(@Param('status') status: PickupRequestStatus) {
        return this.pickupRequestService.getAllByStatus(status);
    }

    @Get('get-total-parked-requests')
    async getTotalParkedRequests(
        @Query('startTime') startTime?: Date,
        @Query('endTime') endTime?: Date) {
        return this.pickupRequestService.getTotalParkedRequests(startTime, endTime);
    }

    @Get('get-top-customer-type')
    async getActiveGate(
        @Query('startTime') startTime?: Date,
        @Query('endTime') endTime?: Date) {
        return this.pickupRequestService.getTopCustomerType(startTime, endTime);
    }

    @Patch('pickup')
    async pickup(@Body() pickupDto: PickupDto) {
        return this.pickupRequestService.pickup(pickupDto);
    }

    @Patch('update-request-status')
    async updateRequestServiceStatus(@Body() updateRequestStatusDto: UpdatePickupRequestStatusDto) {
        return this.pickupRequestService.updatePickupRequestStatus(updateRequestStatusDto);
    }

    @Post('generate-receipt')
    async generateReceipt(@Body() generateReceiptDto: GenerateReceiptDto) {
        return this.pickupRequestService.generateReceipt(generateReceiptDto);
    }
}