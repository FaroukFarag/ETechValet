import { Module } from "@nestjs/common";
import { ReportService } from "./application/services/report.service";
import { ReportController } from "./presentation/controllers/report.controller";
import { ShiftsModule } from "src/shifts/shifts.module";
import { UsersModule } from "src/settings/users/users.module";

@Module({
    imports: [ShiftsModule, UsersModule],
    providers: [ReportService],
    controllers: [ReportController]
})
export class ReportsModule { }