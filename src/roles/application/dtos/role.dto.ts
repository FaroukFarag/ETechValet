import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class RoleDto extends BaseModelDto<number> {
    name: string;
}