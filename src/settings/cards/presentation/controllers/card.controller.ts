import { Controller } from "@nestjs/common";
import { CardDto } from "src/settings/cards/application/dtos/card.dto";
import { CardService } from "src/settings/cards/application/services/card.service";
import { Card } from "src/settings/cards/domain/models/card.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/cards')
export class CardController extends BaseController<
    CardService,
    CardDto,
    CardDto,
    CardDto,
    CardDto,
    Card,
    number> {
    constructor(private readonly cardService: CardService) {
        super(cardService);
    }
}