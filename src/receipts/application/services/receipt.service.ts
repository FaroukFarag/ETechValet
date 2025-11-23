import { Injectable } from "@nestjs/common";
import { Receipt } from "src/receipts/domain/models/receipt.model";
import { BaseService } from "src/shared/application/services/base.service";
import { ReceiptDto } from "../dtos/receipt.dto";
import { ReceiptRepository } from "src/receipts/infrastructure/data/repositories/receipt.repository";

@Injectable()
export class ReceiptService extends BaseService<
    ReceiptDto,
    ReceiptDto,
    ReceiptDto,
    ReceiptDto,
    Receipt,
    number> {
    constructor(private readonly receiptRepository: ReceiptRepository) {
        super(receiptRepository);
    }
}