import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { RoleDto } from "../dtos/role.dto";
import { Role } from "src/settings/roles/domain/models/role.model";
import { RoleRepository } from "src/settings/roles/infrastructure/data/repositories/role.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { RoleClaimRepository } from "../../infrastructure/data/repositories/role-claim.repository";
import { Permission } from "src/shared/domain/enums/permission.enum";

@Injectable()
export class RoleService extends BaseService<
    RoleDto,
    RoleDto,
    RoleDto,
    RoleDto,
    Role,
    number> {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly roleClaimRepository: RoleClaimRepository) {
        super(roleRepository);
    }

    override async create(roleDto: RoleDto): Promise<ResultDto<RoleDto>> {
        return this.executeServiceCall(
            'Create Role',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`name = '${roleDto.name}'`);

                const existingRole = await this.roleRepository.getAllAsync(spec);

                if (existingRole && existingRole.length > 0) {
                    throw new ConflictException('Role already exists');
                }

                const role = this.map(roleDto, Role);

                role.normalizedName = roleDto.name.toUpperCase();

                const createdRole = await this.roleRepository.createAsync(role);

                return this.map(createdRole, RoleDto);
            }
        );
    }

    async roleExists(name: string): Promise<boolean> {
        const spec = new BaseSpecification();

        spec.addCriteria(`name = '${name}'`);

        const roles = await this.roleRepository.getAllAsync(spec);

        return roles && roles.length > 0;
    }

    async getRoleByName(name: string): Promise<ResultDto<RoleDto>> {
        return this.executeServiceCall(
            'Get Role by Name',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`name = '${name}'`);

                const roles = await this.roleRepository.getAllAsync(spec);

                if (!roles || roles.length === 0) {
                    throw new NotFoundException(`Role with name '${name}' not found`);
                }

                return this.map(roles[0], RoleDto);
            }
        );
    }

    async deleteByName(name: string): Promise<ResultDto<RoleDto>> {
        return this.executeServiceCall(
            'Delete Role by Name',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`name = '${name}'`);

                const roles = await this.roleRepository.getAllAsync(spec);

                if (!roles || roles.length === 0) {
                    throw new NotFoundException(`Role with name '${name}' not found`);
                }

                const roleToDelete = roles[0];

                await this.roleRepository.deleteAsync(roleToDelete.id);

                return this.map(roleToDelete, RoleDto);
            }
        );
    }

    async assignPermissions(roleId: number, permissions: Permission[]) {
        return this.executeServiceCall("Assign Permissions to Role", async () => {
            const role = await this.roleRepository.getAsync(roleId);

            if (!role) throw new NotFoundException("Role not found");

            const spec = new BaseSpecification();

            spec.addCriteria(`"roleId" = ${role.id}`);

            const roleClaims = await this.roleClaimRepository.getAllAsync(spec);

            if (roleClaims && roleClaims.length > 0) {
                await this.roleClaimRepository.deleteRangeAsync(roleClaims);
            }

            await this.roleClaimRepository.createRangeAsync(permissions.map((permission) => {
                return {
                    id: 0,
                    roleId,
                    claimType: "permission",
                    claimValue: permission.toString(),
                    role
                }
            }));

            return { roleId, permissions };
        });
    }

    async getPermissions(roleId: number): Promise<ResultDto<Permission[]>> {
        return this.executeServiceCall(
            "Get Role Permissions",
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`"roleId" = ${roleId} AND "claimType" = "permission"`);
                spec.addOrderByDescending('id');

                const claims = await this.roleClaimRepository.getAllAsync(spec);

                return claims
                    .map((c) => c.claimValue)
                    .filter((v): v is keyof typeof Permission => v in Permission)
                    .map((v) => Permission[v]);
            });
    }
}