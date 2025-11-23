import { Module } from "@nestjs/common";
import { RoleRepository } from "./infrastructure/data/repositories/role.repository";
import { RoleService } from "./application/services/role.service";
import { RolesController } from "./presentation/controllers/role.controller";
import { RoleClaim } from "./domain/models/role-claim.model";
import { Role } from "./domain/models/role.model";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleClaimRepository } from "./infrastructure/data/repositories/role-claim.repository";
import { RoleSeeder } from "./infrastructure/seed/role.seed";

@Module({
    imports:[TypeOrmModule.forFeature([Role, RoleClaim])],
    providers: [RoleRepository, RoleClaimRepository, RoleService, RoleSeeder],
    controllers: [RolesController],
    exports: [RoleRepository, RoleSeeder]
})
export class RolesModule { }