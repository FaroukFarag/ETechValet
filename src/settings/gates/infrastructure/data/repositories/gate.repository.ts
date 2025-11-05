import { Injectable } from "@nestjs/common";
import { Gate } from "src/settings/gates/domain/models/gate.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class GateRepository extends BaseRepository<Gate, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Gate);
    }
}