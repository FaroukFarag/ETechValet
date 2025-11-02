import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { RoleDto } from "../dtos/role.dto";
import { Role } from "src/roles/domain/models/role.model";
import { RoleRepository } from "src/roles/infrastructure/data/repositories/role.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";

@Injectable()
export class RoleService extends BaseService<
    RoleDto,
    RoleDto,
    RoleDto,
    RoleDto,
    Role,
    number> {
    constructor(protected readonly roleRepository: RoleRepository) {
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
}