import { Controller } from "@nestjs/common";
import { RoleDto } from "src/roles/application/dtos/role.dto";
import { RoleService } from "src/roles/application/services/role.service";
import { Role } from "src/roles/domain/models/role.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/roles')
export class RolesController extends BaseController<
    RoleService,
    RoleDto,
    RoleDto,
    RoleDto,
    RoleDto,
    Role,
    number> {
    constructor(protected roleService: RoleService) {
        super(roleService);
    }
}