import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { Shift } from "src/shifts/domain/models/shift.model";
import { DataSource } from "typeorm";

@Injectable()
export class ShiftRepository extends BaseRepository<Shift, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Shift);
    }
}