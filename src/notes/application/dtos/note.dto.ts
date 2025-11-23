import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { UserGateDto } from "src/settings/users-gates/application/dtos/user-gate.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class NoteDto extends BaseModelDto<number> {
    message: string;
    requestId: number;
    userId: number;
    request: PickupRequestDto;
    user: UserGateDto;
}