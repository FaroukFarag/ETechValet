import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { ShiftDto } from "src/shifts/application/dtos/shift.dto";
import { ShiftService } from "src/shifts/application/services/shift.service";
import { Shift } from "src/shifts/domain/models/shift.model";

@Controller('api/shifts')
export class ShiftController extends BaseController<
    ShiftService,
    ShiftDto,
    ShiftDto,
    ShiftDto,
    ShiftDto,
    Shift,
    number> {
    constructor(private readonly shiftService: ShiftService) {
        super(shiftService);
    }
}