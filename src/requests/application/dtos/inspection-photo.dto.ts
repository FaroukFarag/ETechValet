import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";
import { PickupRequestDto } from "./pickup-request.dto";

export class InspectionPhotoDto extends BaseModelDto<number> {
    imagePath: string;
    pickupRequestId: number;
    pickupRequest: PickupRequestDto;
}