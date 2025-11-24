import { Controller, Get, Query } from "@nestjs/common";
import { SalesReportDto } from "src/reports/application/dtos/sales-report.dto";
import { ReportService } from "src/reports/application/services/report.service";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Controller('api/reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Get('get-sales-report-by-shift')
    async getSalesReportByShift(@Query('shiftDate') shiftDate?: Date):
        Promise<ResultDto<SalesReportDto[]>> {
        return this.reportService.getSalesReportByShift(shiftDate);
    }
}