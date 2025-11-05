import { Controller } from "@nestjs/common";
import { RoleDto } from "src/settings/roles/application/dtos/role.dto";
import { RoleService } from "src/settings/roles/application/services/role.service";
import { Role } from "src/settings/roles/domain/models/role.model";
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
    constructor(private readonly roleService: RoleService) {
        super(roleService);
    }
}