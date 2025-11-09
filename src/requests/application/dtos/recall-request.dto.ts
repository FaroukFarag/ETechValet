import { BaseRequest } from "src/requests/domain/models/base-request";
import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { UserDto } from "src/settings/users/application/dtos/user.dto";

export class RecallRequestDto extends BaseRequest {
    parkingLocation: string;
    deliveredById: number;
    deliveredBy: UserDto;
    gate: GateDto;
}