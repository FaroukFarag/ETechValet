import { Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { ShiftDto } from "../dtos/shift.dto";
import { Shift } from "src/shifts/domain/models/shift.model";
import { ShiftRepository } from "src/shifts/infrastructure/data/repositories/shift.repository";
import { ShiftStatus } from "src/shifts/domain/enums/shift-status.enum";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";

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

    async getUserLastOpenedShift(userId: number): Promise<ResultDto<ShiftDto | null>> {
        return this.executeServiceCall(
            'Get User Last Opened Shift',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`"userId" = ${userId} AND status = '${ShiftStatus.Opened}'`);
                spec.addOrderByDescending(`startTime`);

                const userLastOpenedShifts = await this.shiftRepository.getAllAsync(spec);

                if (!userLastOpenedShifts || userLastOpenedShifts.length == 0)
                    return null;

                return this.map(userLastOpenedShifts[0], ShiftDto);
            }
        );
    }

    async closeShift(id: number): Promise<ResultDto<ShiftDto>> {
        return this.executeServiceCall(
            'Close Shift',
            async () => {
                const shift = await this.shiftRepository.getAsync(id);

                if (!shift) throw new NotFoundException('Shift Not Found');

                shift.endTime = new Date();
                shift.status = ShiftStatus.Closed;

                await this.shiftRepository.updateAsync(shift);

                return this.map(shift, ShiftDto);
            }
        );
    }
}