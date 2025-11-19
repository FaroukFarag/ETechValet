import { Injectable } from "@nestjs/common";
import { ResetPasswordToken } from "src/settings/users/domain/models/reset-password-token.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class ResetPasswordTokenRepository extends BaseRepository<ResetPasswordToken, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, ResetPasswordToken);
    }
}
