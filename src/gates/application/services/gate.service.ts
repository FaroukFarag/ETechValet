import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { GateDto } from "../dtos/gate.dto";
import { Gate } from "src/gates/domain/models/gate.model";
import { GateRepository } from "src/gates/infrastructure/data/repositories/gate.repository";

@Injectable()
export class GateService extends BaseService<
    GateDto,
    GateDto,
    GateDto,
    GateDto,
    Gate,
    number> {
    constructor(private readonly gateRepository: GateRepository) {
        super(gateRepository);
    }
}
