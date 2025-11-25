import { Injectable } from "@nestjs/common";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { ShiftRepository } from "src/shifts/infrastructure/data/repositories/shift.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { SalesReportDto } from "../dtos/sales-report.dto";
import { UserRepository } from "src/settings/users/infrastructure/data/repositories/user.repository";
import { DriverProductivityReportDto } from "../dtos/driver-productivity-report.dto";
import { RoleName } from "src/settings/roles/domain/enums/role-name.enum";

@Injectable()
export class ReportService {
    constructor(
        private readonly shiftRepository: ShiftRepository,
        private readonly userRepository: UserRepository) { }

    async getShiftSalesReport(shiftDate?: Date): Promise<ResultDto<SalesReportDto[]>> {
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

    async getDriverProductivityReport(
        siteId?: number,
        startTime?: Date,
        endTime?: Date
    ): Promise<ResultDto<DriverProductivityReportDto[]>> {
        try {
            const spec = new BaseSpecification();
            const criteriaParts: string[] = [];

            criteriaParts.push(this.buildRoleCriteria());

            if (siteId) criteriaParts.push(this.buildSiteCriteria(siteId));

            const dateCriteria = this.buildDateCriteria(startTime, endTime);

            if (dateCriteria) criteriaParts.push(dateCriteria);

            spec.addCriteria(criteriaParts.join(" AND "));

            spec.addInclude("userRoles");
            spec.addInclude("receivedRequests");
            spec.addInclude("parkedRequests");
            spec.addInclude("deliveredRequests");

            const users = await this.userRepository.getAllAsync(spec);
            const resultDtos = users.map(u => this.mapToDriverReportDto(u));

            return ResultDto.createSuccessResult(resultDtos);
        }

        catch (error) {
            const msg = error instanceof Error ? error.message : "Unknown error";

            return ResultDto.createFailResult(`Get Sales Report By Shift failed: ${msg}`);
        }
    }

    private buildRoleCriteria(): string {
        return `userRoles.roleId = ${RoleName.Driver}`;
    }

    private buildSiteCriteria(siteId: number): string {
        return `"siteId" = ${siteId}`;
    }

    private buildDateCriteria(start?: Date, end?: Date): string | null {
        if (!start && !end) return null;

        const startIso = start ? `'${start.toISOString()}'` : null;
        const endIso = end ? `'${end.toISOString()}'` : null;

        const fields = [
            "receivedRequests.startTime",
            "parkedRequests.startTime",
            "deliveredRequests.startTime"
        ];

        let conditions: string[] = [];

        if (startIso && endIso) {
            conditions = fields.map(f => `${f} BETWEEN ${startIso} AND ${endIso}`);
        }
        else if (startIso) {
            conditions = fields.map(f => `${f} >= ${startIso}`);
        }
        else if (endIso) {
            conditions = fields.map(f => `${f} <= ${endIso}`);
        }

        return `(${conditions.join(" OR ")})`;
    }

    private mapToDriverReportDto(user: any): DriverProductivityReportDto {
        const dto = new DriverProductivityReportDto();

        dto.driverName = user.userName;
        dto.receives = user.receivedRequests?.length ?? 0;
        dto.parks = user.parkedRequests?.length ?? 0;
        dto.recalls = user.deliveredRequests?.length ?? 0;

        return dto;
    }
}