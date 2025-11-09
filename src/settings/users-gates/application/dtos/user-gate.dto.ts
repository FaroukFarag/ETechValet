import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class UserGateDto extends BaseModelDto<{ userId: number, gateId: number }> {
    user: UserDto;
    gate: GateDto;
}