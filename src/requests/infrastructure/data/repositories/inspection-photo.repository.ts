import { Injectable } from "@nestjs/common";
import { InspectionPhoto } from "src/requests/domain/models/inspection-photo.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class InspectionPhotoRepository extends BaseRepository<InspectionPhoto, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, InspectionPhoto);
    }
}