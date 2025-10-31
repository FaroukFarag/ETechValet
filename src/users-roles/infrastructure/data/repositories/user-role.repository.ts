import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { UserRole } from "src/users-roles/domain/models/user-role.model";
import { DataSource } from "typeorm";

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, UserRole);
    }
}