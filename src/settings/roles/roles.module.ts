import { Module } from "@nestjs/common";
import { RoleRepository } from "./infrastructure/data/repositories/role.repository";
import { RoleService } from "./application/services/role.service";
import { RolesController } from "./presentation/controllers/role.controller";
import { RoleClaim } from "./domain/models/role-claim.model";
import { Role } from "./domain/models/role.model";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports:[TypeOrmModule.forFeature([Role, RoleClaim])],
    controllers: [RolesController],
    providers: [RoleRepository, RoleService],
    exports: [RoleRepository]
})
export class RolesModule { }