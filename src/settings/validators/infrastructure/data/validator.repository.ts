import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { Validator } from "../../domain/models/validator.model";
import { DataSource } from "typeorm";

@Injectable()
export class ValidatorRepository extends BaseRepository<Validator, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Validator);
    }
}