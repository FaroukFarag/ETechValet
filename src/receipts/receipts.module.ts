import { Module } from "@nestjs/common";
import { ReceiptRepository } from "./infrastructure/data/repositories/receipt.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Receipt } from "./domain/models/receipt.model";
import { ReceiptService } from "./application/services/receipt.service";
import { ReceiptController } from "./presentation/controllers/receipt.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Receipt])],
    providers: [ReceiptRepository, ReceiptService],
    controllers: [ReceiptController],
    exports: [ReceiptRepository]
})
export class ReceiptsModule { }