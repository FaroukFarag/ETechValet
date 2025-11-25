import { Controller, Get, Query } from "@nestjs/common";
import { DriverProductivityReportDto } from "src/reports/application/dtos/driver-productivity-report.dto";
import { SalesReportDto } from "src/reports/application/dtos/sales-report.dto";
import { ReportService } from "src/reports/application/services/report.service";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Controller('api/reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get('get-shift-sales-report')
    async getSalesReportByShift(@Query('shiftDate') shiftDate?: Date):
        Promise<ResultDto<SalesReportDto[]>> {
        return this.reportService.getShiftSalesReport(shiftDate);
    }

    @Get('get-date-sales-report')
    async getDateSalesReport(
        @Query('startTime') startTime?: Date,
        @Query('endTime') endTime?: Date):
        Promise<ResultDto<SalesReportDto[]>> {
        return this.reportService.getDateSalesReport(startTime, endTime);
    }

    @Get('get-driver-productivity-report')
    async getDriverProductivityReport(
        @Query('siteId') siteId?: number,
        @Query('startTime') startTime?: Date,
        @Query('endTime') endTime?: Date):
        Promise<ResultDto<DriverProductivityReportDto[]>> {
        return this.reportService.getDriverProductivityReport(siteId, startTime, endTime);
    }
}