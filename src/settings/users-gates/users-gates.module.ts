import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserGate } from "./domain/models/user-gate.model";
import { UserGateRepository } from "./infrastructure/data/repositories/user-gate.repository";
import { UserGateService } from "./application/services/user-gate.service";
import { UserGateController } from "./presentation/controllers/user-gate.controller";

@Module({
    imports: [TypeOrmModule.forFeature([UserGate])],
    providers: [UserGateRepository, UserGateService],
    controllers: [UserGateController]
})
export class UsersGatesModule { }