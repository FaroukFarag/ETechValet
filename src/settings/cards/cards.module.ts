import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Card } from "./domain/models/card.model";
import { CardRepository } from "./infrastructure/data/repositories/card.repository";
import { CardService } from "./application/services/card.service";
import { CardController } from "./presentation/controllers/card.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Card])],
    providers: [CardRepository, CardService],
    controllers: [CardController]
})
export class CardsModule { }