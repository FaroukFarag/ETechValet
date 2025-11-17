import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { BaseRequestDto } from "./base-request.dto";
import { UserDto } from "src/settings/users/application/dtos/user.dto";
import { RequestSiteServiceDto } from "src/requests-sites-services/application/dtos/request-site-service.dto";
import { InspectionPhotoDto } from "./inspection-photo.dto";

export class PickupRequestDto extends BaseRequestDto {
    customerType: number;
    paymentType: number;
    brand?: string;
    color?: string;
    notes?: string;
    receivedById: number;
    parkedById?: number;
    startTime?: Date;
    endTime?: Date;
    gate: GateDto;
    receivedBy: UserDto;
    parkedBy: UserDto;
    requestSiteServices: RequestSiteServiceDto[];
    inspectionPhotos: InspectionPhotoDto[];
}