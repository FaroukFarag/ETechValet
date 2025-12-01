import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { ShiftStatus } from "src/shifts/domain/enums/shift-status.enum";

export class ShiftDto extends BaseModelDto<number> {
    startTime: Date;
    endTime: Date;
    userId: number;
    status: ShiftStatus;
    user: UserDto;
}