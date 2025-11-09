import { Injectable } from "@nestjs/common";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class PickupRequestRepository extends BaseRepository<PickupRequest, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, PickupRequest);
    }
}