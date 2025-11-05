import { Controller } from "@nestjs/common";
import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { GateService } from "src/settings/gates/application/services/gate.service";
import { Gate } from "src/settings/gates/domain/models/gate.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/gates')
export class GateController extends BaseController<
    GateService,
    GateDto,
    GateDto,
    GateDto,
    GateDto,
    Gate,
    number> {
    constructor(private readonly gateService: GateService) {
        super(gateService);
    }
}