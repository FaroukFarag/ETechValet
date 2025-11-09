import { Controller, Delete, Get, Param } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { UserGateService } from "../../application/services/user-gate.service";
import { UserGate } from "../../domain/models/user-gate.model";
import { UserGateDto } from "../../application/dtos/user-gate.dto";
import { ResultDto } from "src/shared/application/dtos/result.dto";

@Controller('api/users-gates')
export class UserGateController extends BaseController<
    UserGateService,
    UserGateDto,
    UserGateDto,
    UserGateDto,
    UserGateDto,
    UserGate,
    { userId: number, gateId: number }> {
    constructor(private readonly userGateService: UserGateService) {
        super(userGateService);
    }

    @Get('get/:userId/:gateId')
    override async get(
        @Param() id: { userId: number, gateId: number },
    ): Promise<ResultDto<UserGateDto>> {
        return this.userGateService.getById(id, UserGate, UserGateDto);
    }

    @Delete('delete/:userId/:gateId')
    override async delete(
        @Param() id: { userId: number, gateId: number }
    ): Promise<ResultDto<UserGateDto>> {
        return this.userGateService.delete(id, UserGate, UserGateDto);
    }
}