import { Controller, Param, Patch } from "@nestjs/common";
import { ResultDto } from "src/shared/application/dtos/result.dto";
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

    @Patch('close-shift/:id')
    async closeShift(@Param('id') id: number): Promise<ResultDto<ShiftDto>> {
        return this.shiftService.closeShift(id);
    }
}