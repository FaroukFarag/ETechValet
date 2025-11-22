import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { ShiftDto } from "../dtos/shift.dto";
import { Shift } from "src/shifts/domain/models/shift.model";
import { ShiftRepository } from "src/shifts/infrastructure/data/repositories/shift.repository";

@Injectable()
export class ShiftService extends BaseService<
    ShiftDto,
    ShiftDto,
    ShiftDto,
    ShiftDto,
    Shift,
    number> {
    constructor(private readonly shiftRepository: ShiftRepository) {
        super(shiftRepository);
    }
}