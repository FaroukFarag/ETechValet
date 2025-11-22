import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shift } from "./domain/models/shift.model";
import { ShiftRepository } from "./infrastructure/data/repositories/shift.repository";
import { ShiftService } from "./application/services/shift.service";
import { ShiftController } from "./presentation/controllers/shift.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Shift])],
    providers: [ShiftRepository, ShiftService],
    controllers: [ShiftController],
    exports: [ShiftRepository]
})
export class ShiftsModule { }