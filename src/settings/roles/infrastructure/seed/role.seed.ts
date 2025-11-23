import { Injectable, Logger } from "@nestjs/common";
import { RoleRepository } from "../data/repositories/role.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { RoleName } from "../../domain/enums/role-name.enum";

@Injectable()
export class RoleSeeder {
    private readonly logger = new Logger(RoleSeeder.name);

    constructor(private readonly roleRepository: RoleRepository) { }

    async seed() {
        const entries = Object.entries(RoleName).filter(
            ([key, value]) => typeof value === "number"
        ) as [string, number][];

        for (const [name, id] of entries) {
            const exists = await this.roleRepository.getAsync(id);

            if (!exists) {
                await this.roleRepository.createAsync({
                    id,
                    name,
                    normalizedName: name.toUpperCase(),
                    roleClaims: [],
                    userRoles: []
                });

                this.logger.log(`Role created: id = ${id}, name = ${name}`);
            }
        }
    }
}
