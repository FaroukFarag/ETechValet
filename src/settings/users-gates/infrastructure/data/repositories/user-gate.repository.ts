import { Injectable } from "@nestjs/common";
import { UserGate } from "src/settings/users-gates/domain/models/user-gate.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class UserGateRepository extends BaseRepository<
    UserGate,
    { userId: number, gateId: number }> {
    constructor(dataSource: DataSource) {
        super(dataSource, UserGate);
    }
}