import { Module } from "@nestjs/common";
import { ReportService } from "./application/services/report.service";
import { ReportController } from "./presentation/controllers/report.controller";
import { ShiftsModule } from "src/shifts/shifts.module";
import { UsersModule } from "src/settings/users/users.module";
import { RequestsModule } from "src/requests/requests.module";

@Module({
    imports: [ShiftsModule, RequestsModule, UsersModule],
    providers: [ReportService],
    controllers: [ReportController]
})
export class ReportsModule { }