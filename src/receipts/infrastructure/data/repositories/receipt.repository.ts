import { Injectable } from "@nestjs/common";
import { Receipt } from "src/receipts/domain/models/receipt.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class ReceiptRepository extends BaseRepository<Receipt, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Receipt);
    }
}