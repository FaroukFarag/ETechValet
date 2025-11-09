import { Injectable } from "@nestjs/common";
import { RecallRequest } from "src/requests/domain/models/recall-request.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class RecallRequestRepository extends BaseRepository<RecallRequest, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, RecallRequest);
    }
}