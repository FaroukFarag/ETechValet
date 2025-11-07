import { Injectable } from "@nestjs/common";
import { Card } from "src/settings/cards/domain/models/card.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class CardRepository extends BaseRepository<Card, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Card);
    }
}