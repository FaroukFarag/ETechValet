import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Gate } from "./domain/models/gate.model";
import { GateRepository } from "./infrastructure/data/repositories/gate.repository";
import { GateService } from "./application/services/gate.service";
import { GateController } from "./presentation/controllers/gate.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Gate])],
    providers: [GateRepository, GateService],
    controllers: [GateController],
    exports: [GateRepository]
})
export class GatesModule { }