import { Controller } from "@nestjs/common";
import { ReceiptDto } from "src/receipts/application/dtos/receipt.dto";
import { ReceiptService } from "src/receipts/application/services/receipt.service";
import { Receipt } from "src/receipts/domain/models/receipt.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/receipts')
export class ReceiptController extends BaseController<
    ReceiptService,
    ReceiptDto,
    ReceiptDto,
    ReceiptDto,
    ReceiptDto,
    Receipt,
    number> {
    constructor(private readonly receiptService: ReceiptService) {
        super(receiptService);
    }
}