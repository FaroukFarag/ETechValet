import { Injectable } from "@nestjs/common";
import { Role } from "src/settings/roles/domain/models/role.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class RoleRepository extends BaseRepository<Role, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Role);
    }
}