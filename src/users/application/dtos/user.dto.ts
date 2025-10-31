import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { RoleDto } from "../../../roles/application/dtos/role.dto";

export class UserDto extends BaseModelDto<number> {
    userName: string;
    email: string;
    password: string;
    roles: RoleDto[];
}