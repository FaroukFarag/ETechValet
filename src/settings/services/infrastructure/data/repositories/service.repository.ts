import { Injectable } from "@nestjs/common";
import { Service } from "src/settings/services/domain/models/service.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class ServiceRepository extends BaseRepository<Service, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Service);
    }
}