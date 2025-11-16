import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { RoleDto } from "../../../roles/application/dtos/role.dto";
import { UserGateDto } from "src/settings/users-gates/application/dtos/user-gate.dto";

export class UserDto extends BaseModelDto<number> {
    userName: string;
    email: string;
    workingHours: number;
    phoneNumber: string;
    roles: RoleDto[];
    userGates: UserGateDto[];
}