import { Injectable } from "@nestjs/common";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { ShiftRepository } from "src/shifts/infrastructure/data/repositories/shift.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { SalesReportDto } from "../dtos/sales-report.dto";

@Injectable()
export class ReportService {
    constructor(private readonly shiftRepository: ShiftRepository) { }

    async getSalesReportByShift(shiftDate?: Date): Promise<ResultDto<SalesReportDto[]>> {
        try {
            const spec = new BaseSpecification();
            const requests = new Array<PickupRequest>();

            if (shiftDate)
                spec.addCriteria(`shift.startTime = '${shiftDate}'`);

            spec.addInclude('requests');
            spec.addInclude('requests.receivedBy');
            spec.addInclude('requests.parkedBy');
            spec.addInclude('requests.recallRequest.deliveredBy');
            spec.addInclude('requests.receipt');
            spec.addInclude('requests.gate.site');

            const shifts = await this.shiftRepository.getAllAsync(spec);

            shifts.forEach(shift => requests.push(...shift.requests));

            const salesReportDtos = requests.map(request => {
                const salesReportDto = new SalesReportDto();

                salesReportDto.siteName = request.gate?.site?.name;
                salesReportDto.requestNo = request.id.toString();
                salesReportDto.startTime = request.startTime;
                salesReportDto.plateNumber = request.plateNumber;
                salesReportDto.gateName = request.gate?.name;
                salesReportDto.customerMobileNumber = request.customerMobileNumber;
                salesReportDto.receivedByName = request.receivedBy?.userName;
                salesReportDto.parkedByName = request.parkedBy?.userName;
                salesReportDto.deliveredByName = request.recallRequest?.deliveredBy?.userName;
                salesReportDto.amount = request.receipt?.valet;
                salesReportDto.paymentTypeName = request.paymentType.toString();

                return salesReportDto;
            });

            return ResultDto.createSuccessResult(salesReportDtos);
        }

        catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';

            return ResultDto.createFailResult(
                `Get Sales Report By Shift failed: ${errorMessage}`,
            );
        }
    }
}