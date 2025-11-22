import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class ShiftDto extends BaseModelDto<number> {
    startTime: Date;
    endTime: Date;
    userId: number;
    user: UserDto;
}