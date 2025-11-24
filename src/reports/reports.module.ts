import { Module } from "@nestjs/common";
import { ReportService } from "./application/services/report.service";
import { ReportController } from "./presentation/controllers/report.controller";
import { ShiftsModule } from "src/shifts/shifts.module";

@Module({
    imports: [ShiftsModule],
    providers: [ReportService],
    controllers: [ReportController]
})
export class ReportsModule { }