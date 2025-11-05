import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { User } from "src/settings/users/domain/models/user.model";
import { DataSource } from "typeorm";

@Injectable()
export class UserRepository extends BaseRepository<User, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, User);
    }
}