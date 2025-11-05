import { Module } from "@nestjs/common";
import { UserRoleRepository } from "src/settings/users-roles/infrastructure/data/repositories/user-role.repository";
import { UserRole } from "./domain/models/user-role.model";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([UserRole])],
    providers: [UserRoleRepository],
    exports: [UserRoleRepository]
})
export class UsersRolesModule { }