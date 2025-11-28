import { NoteDto } from "src/notes/application/dtos/note.dto";
import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class UpdatePickupRequestStatusDto extends BaseModelDto<number> {
    status: PickupRequestStatus;
    parkingLocation: string;
    notes: NoteDto[];
}