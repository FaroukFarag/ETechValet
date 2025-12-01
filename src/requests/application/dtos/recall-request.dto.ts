import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { PickupRequestDto } from "./pickup-request.dto";

export class RecallRequestDto extends BaseModelDto<number> {
    recalledById: number;
    deliveredById: number;
    gateId: number;
    notes: string;
    skipServices: boolean;
    recalledBy: UserDto;
    deliveredBy: UserDto;
    gate: GateDto;
    pickupRequest: PickupRequestDto;
}