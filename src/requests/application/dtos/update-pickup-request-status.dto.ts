import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class UpdatePickupRequestStatusDto extends BaseModelDto<number> {
    status: PickupRequestStatus;
    notes: string;
}