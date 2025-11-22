import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { GateDto } from "../dtos/gate.dto";
import { Gate } from "src/settings/gates/domain/models/gate.model";
import { GateRepository } from "src/settings/gates/infrastructure/data/repositories/gate.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";

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

    async getActiveGate(startTime?: Date, endTime?: Date): Promise<ResultDto<GateDto>> {
        return this.executeServiceCall(
            'Get Active Gate',
            async () => {
                const gate = await this.gateRepository.getActiveGate(startTime, endTime);

                return this.map(gate, GateDto);
            }
        )
    }
}
