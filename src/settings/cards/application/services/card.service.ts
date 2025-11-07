import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { CardDto } from "../dtos/card.dto";
import { Card } from "../../../../settings/cards/domain/models/card.model";
import { CardRepository } from "../../infrastructure/data/repositories/card.repository";

@Injectable()
export class CardService extends BaseService<
    CardDto,
    CardDto,
    CardDto,
    CardDto,
    Card,
    number> {
    constructor(private readonly cardRepository: CardRepository) {
        super(cardRepository);
    }
}
