import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { BaseRequestDto } from "./base-request.dto";
import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { RequestSiteServiceDto } from "src/requests-sites-services/application/dtos/request-site-service.dto";
import { InspectionPhotoDto } from "./inspection-photo.dto";
import { PickupRequestStatus } from "src/requests/domain/enums/pickup-request-status.enum";
import { NoteDto } from "src/notes/application/dtos/note.dto";

export class PickupRequestDto extends BaseRequestDto {
    customerType: number;
    paymentType: number;
    brand?: string;
    color?: string;
    receivedById: number;
    parkedById?: number;
    status?: PickupRequestStatus
    startTime?: Date;
    endTime?: Date;
    gate: GateDto;
    receivedBy: UserDto;
    parkedBy: UserDto;
    notes: NoteDto[];
    requestSiteServices: RequestSiteServiceDto[];
    inspectionPhotos: InspectionPhotoDto[];
}