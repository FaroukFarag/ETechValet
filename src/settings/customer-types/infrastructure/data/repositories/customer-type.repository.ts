import { Injectable } from "@nestjs/common";
import { CustomerType } from "src/settings/customer-types/domain/models/customer-type.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class CustomerTypeRepository extends BaseRepository<CustomerType, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, CustomerType);
    }
}