import { Injectable } from "@nestjs/common";
import { RoleClaim } from "src/settings/roles/domain/models/role-claim.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class RoleClaimRepository extends BaseRepository<RoleClaim, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, RoleClaim);
    }
}