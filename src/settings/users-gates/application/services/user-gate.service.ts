import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { UserGate } from "../../domain/models/user-gate.model";
import { UserGateDto } from "../dtos/user-gate.dto";
import { UserGateRepository } from "../../infrastructure/data/repositories/user-gate.repository";

@Injectable()
export class UserGateService extends BaseService<
    UserGateDto,
    UserGateDto,
    UserGateDto,
    UserGateDto,
    UserGate,
    { userId: number, gateId: number }> {
    constructor(private readonly userGateRepository: UserGateRepository) {
        super(userGateRepository);
    }
}